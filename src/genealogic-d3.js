genealogic_d3 = (function () {
    'use strict';
    var CONFIG_DEFAULTS = Object.freeze({
        svg_tree_selector: 'svg#genealogic-tree',
        json_genealogy: 'genealogy.json', // can be either an URL to a JSON file or a full JSON object
        merge_root_partners: false,
        path_to_miniature_imgs: false, // if evaluates to false, only use optional .miniature_img_url
        miniature_img_ext: '.jpg',
        use_fixed_miniature: true,
        svg_miniature_selector: 'svg#genealogic-miniature',
        miniature_photo_size: 300,
        miniature_birthdate_dy: 50,
        packing_generation_factor: null, // default value is set later on as $genealogy_max_depth - 0.5
        d3_color_scale: 'category20',
        leaf_name_dy: '0.3em',
        leaf_caption_dy: '3em',
        wrapped_text_line_height_ems: 1.5,
        post_rendering_callback: false,
    }),
    extend = function () { // jQuery.extend equivalent
        for (var i = 1; i < arguments.length; i++) {
            for (var key in arguments[i]) {
                if (arguments[i].hasOwnProperty(key)) {
                    arguments[0][key] = arguments[i][key];
                }
            }
        }
        return arguments[0];
    },
    name_to_valid_id = function (name) { // Removes any non-letter/digit/- character
        return name.replace(/[^a-zA-Z0-9-]/g, '');
    },
    name_to_filename = function (name) { // We allow spaces in the displayed text, but not in the filenames
        return encodeURI(name.replace(/ /g, ''));
    },
    name_to_displayed_text = function (name) { // Ugly homonyms handling: 'name' can contain digits to distinguish people, which are stripped below
        return name.replace(/[0-9]/g, '');
    },
    load_img_patterns = function (svg_defs, node, path_to_imgs, img_ext) {
        add_img_pattern(svg_defs, node, path_to_imgs, img_ext);
        if (node.partner) {
            add_img_pattern(svg_defs, node.partner, path_to_imgs, img_ext);
        }
        for (var i = 0; i < (node.children ? node.children.length : 0); i++) {
            load_img_patterns(svg_defs, node.children[i], path_to_imgs, img_ext);
        }
    },
    add_img_pattern = function (svg_defs, node, path_to_imgs, img_ext) {
        var image_url = (path_to_imgs ? path_to_imgs + name_to_filename(node.name) + img_ext : node.miniature_img_url);
        if (image_url) {
            svg_defs.append('svg:pattern')
                .attr('id', name_to_valid_id(node.name))
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
    miniature_mouseover = function (d, conf) {
        var img_id = name_to_valid_id(d.name);
        if (!is_img_pattern_loaded(img_id)) {
            return;
        }
        if (conf.use_fixed_miniature) {
            var miniature_node = d3.select(conf.svg_miniature_selector);
            d.default_node_style = miniature_node.attr('style');
            miniature_node.attr('style', 'display: inherit'); // Override "none"
        }
        var circle = conf.use_fixed_miniature ? miniature_node.select('circle') : d3.select(this);
        d.default_circle_style= circle.attr('style');
        circle.attr('style', 'fill: url(#' + img_id + ')');
        if (conf.use_fixed_miniature && conf.miniature_birthdate_dy) {
            d3.select(conf.svg_miniature_selector).select('text').text(d.birthdate);
        }
    },
    miniature_mouseout = function (d, conf) {
        if (conf.use_fixed_miniature && d.default_node_style) {
            d3.select(conf.svg_miniature_selector).attr('style', d.default_node_style);
        }
        if (d.default_circle_style) {
            var circle = conf.use_fixed_miniature ? miniature_node.select('circle') : d3.select(this);
            circle.attr('style', d.default_circle_style);
        }
    },
    wrap_text = function (selection, content_key, line_height, content_filter) { // Inspired by http://bl.ocks.org/mbostock/7555321
        selection.each(function(d) {
            var text_node = d3.select(this),
                content = (content_filter ? content_filter(d[content_key]) : d[content_key]),
                words = content.split(/\s+/);
            if (words.length === 1) {
                text_node.text(content);
                return;
            }
            var width = d.r * 2,
                line = [],
                line_number = 0,
                tspan = text_node.append('tspan').attr('x', 0).attr('y', 0),
                tspans = [tspan];
            for (var i = 0; i < words.length; i++) {
                var word = words[i];
                line.push(word);
                tspan.text(line.join(' '));
                if (line.length > 1 && tspan.node().getComputedTextLength() > width) {
                    line.pop();
                    tspan.text(line.join(' '));
                    line = [word];
                    tspan = text_node.append('tspan').attr('x', 0).attr('y', 0).text(word);
                    tspans.push(tspan);
                }
            }
            var dy = parseFloat(text_node.attr('dy')) - line_height * (tspans.length - 1) / 2;
            for (line_number = 0; line_number < tspans.length; line_number++) {
                tspan = tspans[line_number];
                tspan.attr('dy', dy + 'em');
                dy += line_height;
            }
        });
    },
    check_exists = function (selector) {
        if (d3.select(selector).empty()) {
            throw new Error('No svg element found for selector: ' + selector);
        }
    },
    generate = function (args) {
        var conf = extend({}, CONFIG_DEFAULTS, args),
            fill = d3.scale[conf.d3_color_scale](),
            svg = d3.select(conf.svg_tree_selector);
        check_exists(conf.svg_tree_selector);

        if (conf.use_fixed_miniature) {
            check_exists(conf.svg_miniature_selector);
            var width = conf.miniature_photo_size,
                height = conf.miniature_photo_size + 4 + conf.miniature_birthdate_dy;
            var miniature_node = d3.select(conf.svg_miniature_selector)
                .attr('width', width)
                .attr('height', height)
                .attr('style', 'display: none');
            miniature_node.append('svg:circle')
                          .attr('class', 'miniature')
                          .attr('cx', conf.miniature_photo_size / 2 + 2)
                          .attr('cy', conf.miniature_photo_size / 2 + 2)
                          .attr('r', conf.miniature_photo_size / 2);
            if (conf.miniature_birthdate_dy) {
                miniature_node.append('svg:text')
                              .attr('x', width / 2)
                              .attr('y', conf.miniature_photo_size + 4 + conf.miniature_birthdate_dy / 2)
                              .attr('style', 'text-anchor: middle');
            }
        }

        var display_genealogy = function (json) {
            if (conf.merge_root_partners && json.partner) {
                json.name = json.name + ' & ' + json.partner.name;
                json.birthdate = json.birthdate + ' & ' + json.partner.birthdate;
                delete json.partner;
            }

            var svg_defs = d3.select(conf.svg_tree_selector).select('defs');
            if (svg_defs.empty()) {
                svg_defs = d3.select(conf.svg_tree_selector).append('svg:defs');
                load_img_patterns(svg_defs, json, conf.path_to_miniature_imgs, conf.miniature_img_ext);
            }
            pre_process_nodes(json);

            var max_tree_depth = get_max_depth(json);
            if (!conf.packing_generation_factor || conf.packing_generation_factor <= max_tree_depth - 1) {
                conf.packing_generation_factor = max_tree_depth - 0.5;
            }

            var links = convert_to_links(json),
                pack = d3.layout.pack()
                    .size([svg.attr('width'), svg.attr('height')])
                    .value(function(d) { return conf.packing_generation_factor - d.generation; }),
                node = svg.datum(json).selectAll('.node')
                    .data(pack.nodes).enter()
                    .append('svg:g')
                        .attr('transform', function(d) { return 'translate(' + d.x + ',' + d.y + ')'; }),
                leaf = node.filter(function(d) { return !d.children; });

            leaf.append('svg:text')
                .attr('class', 'leaf name')
                .attr('dy', conf.leaf_name_dy)
                .call(wrap_text, 'name', conf.wrapped_text_line_height_ems, name_to_displayed_text);
            leaf.filter(function(d) { return d.caption; }).append('svg:text')
                .attr('class', 'leaf caption')
                .attr('dy', conf.leaf_caption_dy)
                .call(wrap_text, 'caption', conf.wrapped_text_line_height_ems);
            leaf.append('svg:circle')
                .attr('class', 'leaf')
                .attr('r', function(d) { return d.r; })
                .style('fill', function(d) { return fill(d.generation + (d.by_alliance_with ? 0.5 : 0)); })
                .style('stroke', function(d) { return d3.rgb(fill(d.generation + (d.by_alliance_with ? 0.5 : 0))).darker(); })
                .attr('title', function(d) { return d.birthdate; })
                .on('mouseover', function (d) { miniature_mouseover(d, conf); })
                .on('mouseout', function (d) { miniature_mouseout(d, conf); });

            svg.selectAll('line').data(links)
                .enter().append('svg:path')
                .attr('class', 'branch')
                .style('stroke', function(d) { return d3.rgb(fill(d.target.by_alliance_with + 1)).darker(); })
                .attr('d', linkArc);

            if (conf.post_rendering_callback) {
                conf.post_rendering_callback();
            }
        };

        if (typeof conf.json_genealogy === 'string') {
            d3.json(conf.json_genealogy, function(json) {
                display_genealogy(json);
            });
        } else {
            display_genealogy(conf.json_genealogy);
        }
    },
    remove = function (args) {
        var conf = extend({}, CONFIG_DEFAULTS, args);
        check_exists(conf.svg_tree_selector);
        d3.select(conf.svg_tree_selector).selectAll('g').remove();
        d3.select(conf.svg_tree_selector).selectAll('path').remove();
        check_exists(conf.svg_miniature_selector);
        d3.select(conf.svg_miniature_selector).selectAll('*').remove();
    };
    return {
        generate: generate,
        remove: remove,
    };
})();