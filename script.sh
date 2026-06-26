#!/usr/bin/env bash
cd ~/DotFiles || exit

for dir in */; do
    dir="${dir%/}"
    
    if [ "$dir" == "gtk-themes" ] || [ "$dir" == "misc" ]; then
        continue
    fi

    echo "⚙️ Stowing package: $dir..."
    rm -rf ~/.config/"$dir"
    mkdir -p ~/.config/"$dir"
    stow -t ~/.config/"$dir" "$dir"
done

