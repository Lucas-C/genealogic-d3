# genealogic-d3

[KISS](http://en.wikipedia.org/wiki/KISS_principle) genealogy tree visualization depending on [d3.js](http://d3js.org) only.

## Demo
https://chezsoi.org/lucas/genealogic-d3/

## Installation
This tool can only display tree-like genealogies, e.g. all nodes are descendants of one given ancestor, like in a pedigree tree.
It won't be able to render generic genealogy graphs with non-unique root ancestor.

A basic setup requires only to put 3 files in a directory, and you'll be able to view the result locally with a browser:

- _genealogic-d3.js_
- an HTML file (cf. [index.html template](#indexhtml-template))
- a JSON 'genealogy' file, describing a descendants tree
- optionally, a subdirectory containing miniatures *.jpg* images, named after the genealogy nodes *.name* attributes.

JSON genealogy structure :

    {
      "name": "Node name",
      "caption": "Optional caption",
      "miniature_img_url": "Optional image url",
      "partner": {
        // Optional node with all standard attributes available, except .children
      },
      "children": [ // Optional
        {
          // Recurse
        }
      ]
    }

You can check the _skywalker\_genealogy.json_ for a complete example. 

### Generating the JS & CSS bundles

The bundles also include the JS & CSS code for the birthday calendar:

    make GENEALOGY=skywalker

### index.html template
For the needs of the demo, _index.html_ is a bit verbose. There is a basic HTML file skeleton to use `genealogic.d3` :

    <script type="text/javascript" src="bundle.js"></script>
    <svg width="1000" height="1000" id="genealogic-tree"/>
    <svg id="genealogic-miniature"/>
    <script type="text/javascript">
    genealogic.generate({
        json_input_genealogy: 'my-family-genealogy.json',
        path_to_miniature_imgs: 'miniatures_dir/'
        use_fixed_miniature: false, // Defaults to true
    });

### Parameters

- **svg_tree_selector** : CSS selector to the main <svg> HTML element where the tree will be inserted.
- **json_input_genealogy** : URI to the JSON genealogy file, or a javascript genealogy dictionary
- **path_to_miniature_imgs** : miniatures images directory URI. If this evaluate to false, only miniatures specified through the optional _.miniature_img_url_ attribute will be used.
- **miniature_img_ext** : the miniatures image files extension
- **use_fixed_miniature** : whether to use a unique floating circle to viusalize miniatures, or else embed them inside each node circle
- **miniature_svg_selector** : CSS selector to the <svg> HTML element that will be used as the miniature "window".
- **miniature_photo_size** : in pixels
- **packing_generation_factor** : control the differences in sizes of the node circles: it must always be higher than the tree max depth,
with high values meaning that all circles will be the same size
- **d3_color_scale** : cf. https://github.com/mbostock/d3/wiki/Ordinal-Scales#categorical-colors
- **wrapped_text_line_height_ems** : spacing in _ems_ between names / captions multiple lines when text needs to be wrapped
- **post_rendering_callback** : if defined, this function will be executed once d3.js rendering over

The list of all those parameters default values can be found in the source code here:
https://github.com/Lucas-C/genealogic-d3/blob/master/genealogic-d3.js#L3

## Notes
This visualization tool can be combined with an 'upload-and-crop-your-own-picture' plugin,
to let members of the family upload their photos themselves. E.g. :

- https://www.filepicker.io
- https://github.com/acornejo/jquery-cropbox
- https://github.com/TuyoshiVinicius/jQuery-Picture-Cut
- https://github.com/andyvr/picEdit

Also, this is a useful command to list missing miniatures:

    diff <(jq -r '..|objects|.name' genealogy.json | sort) <(ls miniatures | sed 's/\..*//' | sort)

## License
Tl;dr plain English version: https://tldrlegal.com/license/adaptive-public-license-1.0-%28apl-1.0%29

## Skywalker family pictures sources
- Anakin: http://ferigato.deviantart.com/art/Darth-Vader-58658508
- Padmé: http://leiaskywalker83.deviantart.com/art/Padme-Refugee-Disguise-102631114
- Luke: https://www.flickr.com/photos/stevegarfield/2855969080
- Mara: https://www.flickr.com/photos/heilemann/376899474
- Ben: http://nikitanielsen.deviantart.com/art/Ben-Skywalker-63659109
- Han: http://verucasalt82.deviantart.com/art/Han-Solo-120883680
- Leia: http://jfgallery.deviantart.com/art/Portrait-Painting-1-Acrylic-114240712
- Jacen: http://saith100.deviantart.com/art/Jacen-vs-Caedus-WIP-68710587
- Jaina: http://deepstriker.deviantart.com/art/Jaina-Solo-409556979

## ToDo
- more code source comments
- cyclotymic complexity below 5
- better handle homonyms
- mobile-friendly responsive version

