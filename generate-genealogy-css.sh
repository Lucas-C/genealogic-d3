#!/bin/bash

# This is simply a quick & dirty script,
# it would have been better done in gulpfile.js

set -o pipefail -o errexit -o nounset #-o xtrace

MINIATURES_DIR=${1?'Missing miniatures directory path parameter'}
OUT_CSS_FILE=src/birthday-calendar-genealogy.css

rm -f "$OUT_CSS_FILE"

for img in $MINIATURES_DIR/*; do
    name=$(basename $img)
    name=${name%.jpg}
    cat <<EOF >>"$OUT_CSS_FILE"
.birthday-${name} .number:after {
    content: '$(echo $name | sed 's/[0-9]//g')' !important;
    line-height: 6.5rem;
    font-size: inherit !important;
}
.birthday-${name} .number {
    background-image: url('$img');
}
EOF
done
