var genealogic = (function () { /* exported genealogic */
    'use strict';
    var CONFIG_DEFAULTS = {
        main_svg_width: 800,
        main_svg_height: 800,
        main_svg_html_anchor_selector: 'body',
        json_input_genealogy: 'genealogy.json',
        path_to_miniature_imgs: false, // if evaluates to false, only use optional .miniature_img_url
        miniature_img_ext: '.jpg',
        use_fixed_miniature: true,
        miniature_svg_html_anchor_selector: 'body',
        miniature_photo_size: 300,
        packing_generation_factor: null, // default value is set later on as $genealogy_max_depth - 0.5
        d3_color_scale: 'category20',
        leaf_name_dy: '0.3em',
        leaf_caption_dy: '1.8em',
        post_rendering_callback: false,
    },
    extend = function (extended, update) {
        for (var key in update) {
            if (update.hasOwnProperty(key)) {
                extended[key] = update[key];
            }
        }
        return (arguments[2] ? extend.apply(extended, [].slice.call(arguments, 1)) : extended);
    },
    string_to_valid_id = function (str) { // Removes any non-letter/digit/- character
        return str.replace(/[^a-zA-Z0-9-]/g, '');
    },
    load_img_patterns = function (node, path_to_imgs, img_ext, defs) {
        defs = defs || d3.select('svg#genealogic').append('svg:defs');
        add_img_pattern(defs, node, path_to_imgs, img_ext);
        if (node.partner) {
            add_img_pattern(defs, node.partner, path_to_imgs, img_ext);
        }
        for (var i = 0; i < (node.children ? node.children.length : 0); i++) {
            load_img_patterns(node.children[i], path_to_imgs, img_ext, defs);
        }
    },
    add_img_pattern = function (defs, node, path_to_imgs, img_ext) {
        var image_url = (path_to_imgs ? path_to_imgs + encodeURI(node.name) + img_ext : node.miniature_img_url);
        if (image_url) {
            defs.append('svg:pattern')
                .attr('id', string_to_valid_id(node.name))
                .attr('patternContentUnits', 'objectBoundingBox')
                .attr('height', '100%')
                .attr('width', '100%')
                .append('svg:image')
                    .attr('preserveAspectRatio', 'xMidYMid slice')
                    .attr('height', '1')
                    .attr('width', '1')
                    .attr('xlink:href', image_url);
        }
    },
    is_img_pattern_loaded = function (img_id) {
        var img_href = d3.select('#' + img_id + ' image').attr('href'),
            tmp_img = new Image();
        tmp_img.src = img_href;
        return tmp_img.width > 0 && tmp_img.height > 0;
    },
    pre_process_nodes = function (node, generation) {
        node.generation = (typeof node.generation !== 'undefined' ? node.generation : generation || 0);
        if (node.partner) { // Adding as a child node
            node.partner.by_alliance_with = node.name;
            node.partner.generation = node.generation;
            if (node.children) {
                node.children.push(node.partner);
            } else {
                node.children = [node.partner];
            }
        }
        if (node.children) { // Making a shallow child copy
            var itself = {}; for (var k in node) { itself[k] = node[k]; }
            delete itself.children; // To avoid processing them twice & recursion
            delete itself.partner; // To avoid processing it twice
            node.itself = itself;
            node.children.push(itself);
        }
        for (var i = 0; i < (node.children ? node.children.length : 0); i++) {
            pre_process_nodes(node.children[i], node.generation + 1);
        }
    },
    get_max_depth = function (node) {
        var child_max_depth = 0;
        for (var i = 0; i < (node.children ? node.children.length : 0); i++) {
            var child_depth = get_max_depth(node.children[i]);
            if (child_depth > child_max_depth) {
                child_max_depth = child_depth;
            }
        }
        return child_max_depth + 1;
    },
    convert_to_links = function (node) {
        var out_links = [];
        var node_itself = node.itself || node;
        for (var j = 0; j < (node.children ? node.children.length : 0); j++) {
            var child_node = node.children[j];
            if (child_node === node_itself) { continue; }
            out_links.push({source: node_itself, target: child_node.itself || child_node});
            [].push.apply(out_links, convert_to_links(child_node));
        }
        return out_links;
    },
    linkArc = function (d) {
        var dx = d.target.x - d.source.x,
            dy = d.target.y - d.source.y,
            dr = Math.sqrt(dx * dx + dy * dy);
        return 'M' + d.source.x + ',' + d.source.y + 'A' + dr + ',' + dr + ' 0 0,1 ' + d.target.x + ',' + d.target.y;
    },
    miniature_mouseover = function (d, miniature_node) {
        var img_id = string_to_valid_id(d.name);
        d.default_style = miniature_node.attr('style');
        d.default_class = miniature_node.attr('class');
        if (is_img_pattern_loaded(img_id)) {
            miniature_node.attr('style', 'fill-opacity: 1; fill: url(#' + img_id + ')')
                .attr('class', d.default_class + ' filled_with_img');
        }
    },
    miniature_mouseout = function (d, miniature_node) {
        miniature_node.attr('style', d.default_style).attr('class', d.default_class);
    },
    generate = function (args) {
        var conf = extend({}, CONFIG_DEFAULTS, args),
            fill = d3.scale[conf.d3_color_scale](),
            svg = d3.select(conf.main_svg_html_anchor_selector).append('svg')
                .attr('id', 'genealogic')
                .attr('width', conf.main_svg_width)
                .attr('height', conf.main_svg_height);

        if (conf.use_fixed_miniature) {
            d3.select(conf.miniature_svg_html_anchor_selector).append('svg')
                .attr('id', 'miniature')
                .attr('width', conf.miniature_photo_size + 4)
                .attr('height', conf.miniature_photo_size + 4)
                .append('svg:circle')
                    .attr('class', 'miniature')
                    .attr('cx', conf.miniature_photo_size / 2 + 2)
                    .attr('cy', conf.miniature_photo_size / 2 + 2)
                    .attr('r', conf.miniature_photo_size / 2)
                    .attr('style', 'fill-opacity: 0');
        }

        var display_genealogy = function (json) {
            load_img_patterns(json, conf.path_to_miniature_imgs, conf.miniature_img_ext);
            pre_process_nodes(json);

            var max_tree_depth = get_max_depth(json);
            if (!conf.packing_generation_factor || conf.packing_generation_factor <= max_tree_depth - 1) {
                conf.packing_generation_factor = max_tree_depth - 0.5;
            }

            var links = convert_to_links(json),
                pack = d3.layout.pack()
                    .size([conf.main_svg_width, conf.main_svg_height])
                    .value(function(d) { return conf.packing_generation_factor - d.generation; }),
                node = svg.datum(json).selectAll('.node')
                    .data(pack.nodes).enter()
                    .append('svg:g')
                        .attr('transform', function(d) { return 'translate(' + d.x + ',' + d.y + ')'; }),
                leaf = node.filter(function(d) { return !d.children; });

            leaf.append('svg:text')
                .attr('class', 'leaf name')
                .attr('dy', conf.leaf_name_dy)
                // Ugly homonyms handling: 'name' can contain digits to distinguish people, which are stripped below
                .text(function(d) { return d.name.replace(/[0-9]/g, ''); });
            leaf.filter(function(d) { return d.caption; }).append('svg:text')
                .attr('class', 'leaf caption')
                .attr('dy', conf.leaf_caption_dy)
                .text(function(d) { return d.caption; });
            leaf.append('svg:circle')
                .attr('class', 'leaf')
                .attr('r', function(d) { return d.r; })
                .style('fill', function(d) { return fill(d.generation + (d.by_alliance_with ? 0.5 : 0)); })
                .style('stroke', function(d) { return d3.rgb(fill(d.generation + (d.by_alliance_with ? 0.5 : 0))).darker(); })
                .on('mouseover', function (d) {
                    miniature_mouseover(d, (conf.use_fixed_miniature ? d3.select('svg#miniature circle') : d3.select(this)));
                })
                .on('mouseout', function (d) {
                    miniature_mouseout(d, (conf.use_fixed_miniature ? d3.select('svg#miniature circle') : d3.select(this)));
                });

            svg.selectAll('line').data(links)
                .enter().append('svg:path')
                .attr('class', 'branch')
                .style('stroke', function(d) { return d3.rgb(fill(d.target.by_alliance_with + 1)).darker(); })
                .attr('d', linkArc);

            if (conf.post_rendering_callback) {
                conf.post_rendering_callback();
            }
        };

        if (typeof conf.json_input_genealogy === 'string') {
            d3.json(conf.json_input_genealogy, function(json) {
                display_genealogy(json);
            });
        } else {
            display_genealogy(conf.json_input_genealogy);
        }
    },
    remove = function (args) {
        args = args || {};
        var html_anchor_selector = args.html_anchor_selector || 'body';
        d3.select(html_anchor_selector).select('svg#genealogic').remove();
        d3.select(html_anchor_selector).select('svg#miniature').remove();
    };
    return {
        generate: generate,
        remove: remove,
    };
})();
