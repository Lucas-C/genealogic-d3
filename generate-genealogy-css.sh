#!/bin/bash

set -o pipefail -o errexit -o nounset #-o xtrace

genealogy=${1?'Missing genealogy parameter'}
out_css_file=birthday-calendar-${genealogy}.css
img_dir=miniatures_${genealogy}
img_ext=jpg

rm -f "$out_css_file"

jq -r '..|objects|.name' ${genealogy}_genealogy.json | while read name; do
    name_without_spaces=$(echo ${name} | sed 's/ //g')
    cat <<EOF >>"$out_css_file"
.flex-calendar .days .day.birthday-${name_without_spaces} .number:after {
    content: '$(echo ${name} | sed 's/[0-9]//g')' !important;
    line-height: 6.5rem;
    font-size: inherit !important;
}
.flex-calendar .days .day.birthday-${name_without_spaces} .number {
    background-image: url('${img_dir}/${name_without_spaces}.${img_ext}');
}
EOF
done
