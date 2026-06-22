#!/bin/bash

# Directories
cache_dir="$HOME/.config/hypr/.cache"
wallCache="$cache_dir/.wallpaper"
wallDIR="$HOME/DotFiles/Walls"

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

# Если папка пуста, завершаем скрипт, чтобы избежать ошибок
if [[ ${#PICS[@]} -eq 0 ]]; then
  exit 0
fi

RANDOM_PIC="${PICS[$((RANDOM % ${#PICS[@]}))]}"
RANDOM_PIC_NAME="${#PICS[@]}. random"

# Rofi commands
rofi_command="rofi -show -dmenu -config ~/.config/rofi/themes/rofi-wall.rasi"

# Создаем ассоциативный массив
declare -A path_map
choices=""

# Быстрый цикл без использования внешних команд (subshells)
for pic in "${PICS[@]}"; do
  # Удаляем базовый путь
  rel_path="${pic#$wallDIR/}"
  
  # Проверяем, находится ли файл в подпапке
  if [[ "$rel_path" != */* ]]; then
      # Файл в корне папки Walls
      display_name="$rel_path"
  else
      # Встроенная в Bash замена basename и dirname (выполняется моментально)
      base_name="${rel_path##*/}"
      dir_name="${rel_path%/*}"
      
      # Быстрое разделение пути и извлечение первых букв
      IFS='/' read -ra ADDR <<< "$dir_name"
      short_dir=""
      for part in "${ADDR[@]}"; do
          short_dir+="${part:0:1}/"
      done
      display_name="${short_dir}${base_name}"
  fi

  # Защита от конфликтов имен
  while [[ -n "${path_map["$display_name"]}" ]]; do
      display_name+=" "
  done

  # Запись в память
  path_map["$display_name"]="$rel_path"
  choices+="$display_name\n"
done

# Добавляем пункт со случайными обоями
choices+="$RANDOM_PIC_NAME"

# Get user choice (выводим весь список разом)
choice=$(echo -e "$choices" | ${rofi_command})

# Exit if no choice is made (user pressed escape)
if [[ -z "$choice" ]]; then
  exit 0
fi

# Set the wallpaper based on choice
if [[ "$choice" == "$RANDOM_PIC_NAME" ]]; then
    awww img "$RANDOM_PIC" $SWWW_PARAMS
    echo "$RANDOM_PIC" > "$wallCache"
else
    real_rel_path="${path_map["$choice"]}"
    awww img "$wallDIR/$real_rel_path" $SWWW_PARAMS
    echo "$wallDIR/$real_rel_path" > "$wallCache"
fi
