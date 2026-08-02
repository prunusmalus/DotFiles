#!/bin/bash

# --- НАСТРОЙКИ ---

# Пути к вашим трем скриптам (замените на свои!)
script_path1="quickshell -c ~/.config/quickshell/hyprquickshot/ -n"
script_path2="~/.config/hypr/scripts/record_area.sh"
script_path3="~/.config/hypr/scripts/test0.sh"

# Названия, которые будут видны в меню
label1="🚀 Вариант 1"
label2="⚙️ Вариант 2"
label3="📁 Вариант 3"

# --- ЛОГИКА ---

# Показываем меню и сохраняем выбор
# -p "Запуск" — это текст подсказки (prompt)
selected=$(echo -e "$label1\n$label2\n$label3" | rofi -dmenu -p "Запуск скриптов")

# Сравниваем выбор и запускаем нужный файл
case "$selected" in
    "$label1")
        "$script_path1"
        ;;
    "$label2")
        "$script_path2"
        ;;
    "$label3")
        "$script_path3"
        ;;
esac
