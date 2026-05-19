#!/bin/bash

# Directories
cache_dir="$HOME/.config/hypr/.cache"
wallCache="$cache_dir/.wallpaper"
# Force TokyoNight directory as per your original script
wallDIR="$HOME/.config/hypr/Wallpapers/TokyoNight"

# Ensure cache file exists
mkdir -p "$cache_dir"
[[ ! -f "$wallCache" ]] && touch "$wallCache"

# Transition config
FPS=60
TYPE="random"
DURATION=1
SWWW_PARAMS="--transition-fps $FPS --transition-type $TYPE --transition-duration $DURATION"

# Retrieve image files
mapfile -d '' PICS < <(find "${wallDIR}" -type f \( -iname \*.jpg -o -iname \*.jpeg -o -iname \*.png -o -iname \*.gif \) -print0 | sort -z)
RANDOM_PIC="${PICS[$((RANDOM % ${#PICS[@]}))]}"
RANDOM_PIC_NAME="${#PICS[@]}. random"

# Rofi commands
rofi_command="rofi -show -dmenu -config ~/.config/rofi/themes/rofi-wall.rasi"

menu() {
  for i in "${!PICS[@]}"; do
    # Extract just the filename
    filename=$(basename "${PICS[$i]}")
    # Displaying .gif to indicate animated images
    if [[ "$filename" == *.gif ]]; then
      printf "%s\n" "$filename"
    else
      printf "%s\n" "$filename"
    fi
  done
  printf "%s\n" "$RANDOM_PIC_NAME"
}

# Get user choice
choice=$(menu | ${rofi_command})

# Exit if no choice is made (user pressed escape)
if [[ -z "$choice" ]]; then
  exit 0
fi

# Set the wallpaper based on choice
if [[ "$choice" == "$RANDOM_PIC_NAME" ]]; then
    # Random picture selected
    awww img "$RANDOM_PIC" $SWWW_PARAMS
else
    # Specific picture selected
    awww img "$wallDIR/$choice" $SWWW_PARAMS
fi

# Save current wallpaper to cache
echo "$wallDIR/$choice" > "$wallCache"
