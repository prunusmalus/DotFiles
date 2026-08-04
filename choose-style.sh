#!/usr/bin/env bash
# Единый скрипт выбора стиля для конфигов с несколькими вариантами.
#
# После клонирования DotFiles можно быстро выбрать стиль:
#   ./choose-style.sh            — интерактивное меню
#   ./choose-style.sh fish       — переключить только fish
#   ./choose-style.sh waybar     — переключить только waybar
#   ./choose-style.sh fish current — установить конкретный стиль без меню
set -euo pipefail

DOTFILES="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

fish_switch() {
    "$DOTFILES/fish/switch-style.sh" "${1:-menu}"
}

waybar_switch() {
    "$DOTFILES/waybar/switch-style.sh" "${1:-menu}"
}

case "${1:-menu}" in
    fish)
        fish_switch "${2:-menu}"
        ;;
    waybar)
        waybar_switch "${2:-menu}"
        ;;
    menu|"")
        echo "Какой стиль настроить?"
        echo "  1) fish   — актуальный / legacy (macOS)"
        echo "  2) waybar — current (niri) / legacy"
        echo "  3) всё"
        read -rp "> " choice
        case "$choice" in
            1|fish) fish_switch ;;
            2|waybar) waybar_switch ;;
            3|all)
                fish_switch
                waybar_switch
                ;;
            *) echo "Неверный выбор" >&2; exit 1 ;;
        esac
        ;;
    *)
        echo "Неизвестный аргумент: $1" >&2
        echo "Использование: $0 [fish|waybar|menu]" >&2
        exit 1
        ;;
esac
