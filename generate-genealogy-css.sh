#!/bin/bash

set -o pipefail -o errexit -o nounset #-o xtrace

MINIATURES_DIR=${1?'Missing miniatures directory path parameter'}
OUT_CSS_FILE=${2?'Missing output CSS filename'}

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
