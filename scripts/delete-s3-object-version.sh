#!/usr/bin/env bash

set -eEo pipefail
shopt -s inherit_errexit >/dev/null 2>&1 || true

if [[ ! "$#" -eq 2 || "$1" != --bucket ]]; then
    echo -e "USAGE: $(basename "$0") --bucket <bucket>"
    exit 2
fi

# $@ := bucket_name
empty_bucket() {
    local -r bucket="${1:?}"
    for object_type in Versions DeleteMarkers; do
        local opt=() next_token=""
        while [[ "$next_token" != null ]]; do
            page="$(aws s3api list-object-versions --output text --bucket "$bucket" --output json --max-items 400 "${opt[@]}" \
                        --query="[{Objects: ${object_type}[].{Key:Key, VersionId:VersionId}}, NextToken]")"
            objects="$(jq -r '.[0]' <<<"$page")"
            next_token="$(jq -r '.[1]' <<<"$page")"
            case "$(jq -r .Objects <<<"$objects")" in
                '[]'|null) break;;
                *) opt=(--starting-token "$next_token")
                   aws s3api delete-objects --bucket "$bucket" --delete "$objects" --output text;;
            esac
        done
    done
}

empty_bucket "${2#s3://}"