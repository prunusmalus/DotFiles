#!/bin/bash
# find_hardcoded_paths.sh
grep -r --include="*.conf" --include="*.kdl" --include="*.lua" --include="*.fish" --include="*.rasi" \
    -E '/home/[^/]+' .
