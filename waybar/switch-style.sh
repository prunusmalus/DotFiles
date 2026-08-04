#!/usr/bin/env bash
# Переключение стиля waybar между current (niri + matugen) и legacy.
#
# Использование:
#   ./switch-style.sh            — интерактивное меню
#   ./switch-style.sh current    — установить актуальный niri-стиль
#   ./switch-style.sh legacy     — установить старый legacy-стиль
set -euo pipefail

DOTFILES="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_DIR="$HOME/.config/waybar"

if [ ! -d "$CONFIG_DIR" ]; then
    echo "Ошибка: $CONFIG_DIR не существует" >&2
    exit 1
fi

CURRENT_FILES=(
    "config.jsonc"
    "modules.jsonc"
    "modules-dividers.jsonc"
    "colors.css"
    "style.css"
)

LEGACY_FILES=(
    "config.jsonc"
    "modules.jsonc"
    "colors.css"
    "style.css"
)

restart_waybar() {
    if pgrep -x waybar >/dev/null 2>&1; then
        killall waybar 2>/dev/null || true
        sleep 0.5
        nohup waybar >/dev/null 2>&1 &
        echo "waybar перезапущен"
    else
        echo "waybar не запущен — конфиги обновлены, запусти вручную"
    fi
}

apply_current() {
    for f in "${CURRENT_FILES[@]}"; do
        cp "$DOTFILES/$f" "$CONFIG_DIR/$f"
    done
    echo "OK: установлен current стиль (niri + matugen)"
    restart_waybar
}

apply_legacy() {
    for f in "${LEGACY_FILES[@]}"; do
        cp "$DOTFILES/legacy/$f" "$CONFIG_DIR/$f"
    done
    echo "OK: установлен legacy стиль"
    restart_waybar
}

case "${1:-menu}" in
    current|cur|1)
        apply_current
        ;;
    legacy|old|2)
        apply_legacy
        ;;
    menu|"")
        echo "Выбери стиль waybar:"
        echo "  1) current — актуальный: niri-модули, matugen-цвета, разделители"
        echo "  2) legacy  — старый: hypr-модули, старые цвета"
        read -rp "> " choice
        case "$choice" in
            1|current) apply_current ;;
            2|legacy|old) apply_legacy ;;
            *) echo "Неверный выбор" >&2; exit 1 ;;
        esac
        ;;
    *)
        echo "Неизвестный аргумент: $1" >&2
        echo "Использование: $0 [current|legacy|menu]" >&2
        exit 1
        ;;
esac
