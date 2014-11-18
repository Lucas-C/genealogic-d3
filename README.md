# genealogic-d3

[KISS](http://en.wikipedia.org/wiki/KISS_principle) genealogy tree visualization using [d3.js](http://d3js.org) only.

## Demo
https://chezsoi.org/lucas/genealogic-d3/skywalker.html

## HTML usage example

    <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/d3/3.4.13/d3.js"></script>
    <script type="text/javascript" src="genealogic-d3.js"></script>
    <script type="text/javascript">
    genealogic.generate({
        json_input_genealogy: 'skywalker_genealogy.json',
        path_to_miniature_imgs: 'miniatures_skywalker/'
        use_fixed_miniature: false,
    });

## Requirements
This tool is only adequate to display tree-like genealogies, e.g. all nodes are descendants of one given ancestor, like in a pedigree tree.
It can not display generic genealogy graphs with non-unique root ancestor.

A basic setup requires only two things:

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

## Needed dependencies
[d3.js](http://d3js.org) only.

## Parameters
- *main_svg_width* : main <svg> window width in pixels
- *main_svg_height* : main <svg> window height in pixels
- *main_svg_html_anchor_selector* : CSS selector to the HTML element where the main <svg> window will be created
- *json_input_genealogy* : URI to the JSON genealogy file, or a javascript genealogy dictionary
- *path_to_miniature_imgs* : miniatures images directory URI. If this evaluate to false, only miniatures specified through the optional _.miniature_img_url_ attribute will be used.
- *miniature_img_ext* : the miniatures image files extension
- *use_fixed_miniature* : whether to use a unique floating circle to viusalize miniatures, or else embed them inside each node circle
- *miniature_svg_html_anchor_selector* : CSS selector to the HTML element where the miniature <svg> window will be created
- *miniature_photo_size* : in pixels
- *packing_generation_factor* : control the differences in sizes of the node circles: it must always be higher than the tree max depth,
with high values meaning that all circles will be the same size
- *d3_color_scale* : cf. https://github.com/mbostock/d3/wiki/Ordinal-Scales#categorical-colors

The list of all those parameters default values can be found in the source code here:
https://github.com/Lucas-C/genealogic-d3/blob/master/genealogic-d3.js#L93

## Notes
This visualization tool can be combined with an 'upload-and-crop-your-own-picture' plugin,
to let members of the family upload their photos themselves. E.g. :
    * https://github.com/acornejo/jquery-cropbox
    * https://github.com/TuyoshiVinicius/jQuery-Picture-Cut
    * https://github.com/andyvr/picEdit

## License
Tl;dr plain English version: https://tldrlegal.com/license/adaptive-public-license-1.0-%28apl-1.0%29#fulltext

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
- cyclotymic complexity below 5
- better handle homonyms
- mobile-friendly responsive version

