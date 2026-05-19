#!/bin/bash

# ==========================================
# НАСТРОЙКИ ПУТЕЙ
# ==========================================
BOOKS_DIR="$HOME/Documents/Textbooks"
CACHE_DIR="$HOME/.config/hypr/.cache/book_thumbs"
READER="xdg-open"

# Читаем тему, если она нужна для Rofi
theme=$(cat "$HOME/.config/hypr/.cache/.theme")

# ИСПОЛЬЗУЕМ НОВЫЙ КОНФИГ ROFI (rofi-books.rasi)
rofi_command="rofi -show -dmenu -config ~/.config/rofi/themes/rofi-books.rasi"

# Создаем папки, если их нет
[[ ! -d "$BOOKS_DIR" ]] && mkdir -p "$BOOKS_DIR"
[[ ! -d "$CACHE_DIR" ]] && mkdir -p "$CACHE_DIR"

# Получаем список книг
BOOKS=($(ls "${BOOKS_DIR}" | grep -E ".pdf$|.djvu$|.epub$|.mobi$"))

# ==========================================
# ФОРМИРОВАНИЕ МЕНЮ И ОБЛОЖЕК
# ==========================================
menu() {
  for i in "${!BOOKS[@]}"; do
    book_file="${BOOKS[$i]}"
    book_name="${book_file%.*}"
    thumb_file="$CACHE_DIR/${book_name}.jpg"

    # Если это PDF и картинки-обложки еще нет в кэше — генерируем её
    if [[ ! -f "$thumb_file" && "$book_file" == *.pdf ]]; then
      # Берем 1 страницу (-f 1 -l 1), делаем jpg шириной 200px
      pdftoppm -jpeg -f 1 -l 1 -singlefile -scale-to 200 "$BOOKS_DIR/$book_file" "${thumb_file%.jpg}" 2>/dev/null
    fi

    # Отправляем в Rofi имя книги и путь к сгенерированной картинке
    if [[ -f "$thumb_file" ]]; then
      printf "%s\x00icon\x1f%s\n" "$book_name" "$thumb_file"
    else
      # Резервная иконка, если сгенерировать не вышло
      printf "%s\x00icon\x1ftext-x-generic\n" "$book_name"
    fi
  done
}

# ==========================================
# ВЫЗОВ ROFI И ОТКРЫТИЕ
# ==========================================
choice=$(menu | $rofi_command)

if [[ -n "$choice" ]]; then
  # Ищем полный файл по выбранному имени (чтобы восстановить расширение .pdf)
  full_name=$(ls "$BOOKS_DIR" | grep "^$choice")
  $READER "$BOOKS_DIR/$full_name" &
fi
