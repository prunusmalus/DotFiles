#!/usr/bin/env bash
# Переключение стиля fish между актуальным и legacy (macOS) конфигом.
#
# Использование:
#   ./switch-style.sh            — интерактивное меню
#   ./switch-style.sh current    — установить актуальный стиль
#   ./switch-style.sh legacy     — установить legacy (macOS) стиль
set -euo pipefail

DOTFILES="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_DIR="$HOME/.config/fish"

if [ ! -d "$CONFIG_DIR" ]; then
    echo "Ошибка: $CONFIG_DIR не существует" >&2
    exit 1
fi

# Симлинк на файл в DotFiles. Если на месте лежит реальный файл (не симлинк) —
# сначала сохраняем его в бэкап, чтобы ничего не потерять.
link_file() {
    local src="$1" dst="$2"
    if [ -e "$dst" ] && [ ! -L "$dst" ]; then
        mv "$dst" "$dst.bak-$(date +%Y%m%d-%H%M%S)"
        echo "  реальный файл $(basename "$dst") сохранён как бэкап"
    fi
    ln -sfn "$(realpath --relative-to "$(dirname "$dst")" "$src")" "$dst"
}

apply_current() {
    link_file "$DOTFILES/config.fish" "$CONFIG_DIR/config.fish"
    echo "OK: установлен актуальный стиль fish (config.fish)"
}

apply_legacy() {
    link_file "$DOTFILES/config.fish.macos" "$CONFIG_DIR/config.fish"
    echo "OK: установлен legacy стиль fish (config.fish.macos)"
}

case "${1:-menu}" in
    current|cur|1)
        apply_current
        ;;
    legacy|macos|old|2)
        apply_legacy
        ;;
    menu|"")
        echo "Выбери стиль fish:"
        echo "  1) current — актуальный, настроенный под эту систему"
        echo "  2) legacy  — старый конфиг с macOS-путями (/opt/homebrew)"
        read -rp "> " choice
        case "$choice" in
            1|current) apply_current ;;
            2|legacy|macos) apply_legacy ;;
            *) echo "Неверный выбор" >&2; exit 1 ;;
        esac
        ;;
    *)
        echo "Неизвестный аргумент: $1" >&2
        echo "Использование: $0 [current|legacy|menu]" >&2
        exit 1
        ;;
esac
