#!/usr/bin/env bash
# Переключение стиля waybar.
#
#  1) current  — актуальный: niri-модули, matugen-цвета, разделители
#  2) legacy   — старый: hypr-модули, старые цвета
#  3) current config + legacy style   — конфиг как сейчас, стиль как раньше
#  4) legacy config + current style   — конфиг как раньше, стиль как сейчас
#  5) hybrid   — legacy-модули (погода, медиа, cpu, память...), current-стиль
#
# Использование:
#   ./switch-style.sh            — интерактивное меню
#   ./switch-style.sh current    — вариант 1
#   ./switch-style.sh legacy     — вариант 2
#   ./switch-style.sh v3         — вариант 3
#   ./switch-style.sh v4         — вариант 4
#   ./switch-style.sh hybrid     — вариант 5
set -euo pipefail

DOTFILES="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_DIR="$HOME/.config/waybar"

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

# Все файлы, которыми управляет скрипт.
ALL_FILES="config.jsonc modules.jsonc modules-dividers.jsonc colors.css style.css"

# apply_variant <dir> <файлы...>
# 1) убирает симлинки на файлы, которых нет в текущем варианте (чтобы конфиг
#    не собирался из разных вариантов);
# 2) ставит симлинки на нужные файлы варианта;
# 3) перезапускает waybar.
apply_variant() {
    local dir="$1"; shift
    # убрать лишние симлинки
    for f in $ALL_FILES; do
        if [ -L "$CONFIG_DIR/$f" ]; then
            if ! printf '%s\n' "$@" | grep -qx "$f"; then
                rm "$CONFIG_DIR/$f"
                echo "  убран лишний симлинк $f"
            fi
        fi
    done
    # поставить нужные
    for f in "$@"; do
        link_file "$DOTFILES/$dir/$f" "$CONFIG_DIR/$f"
    done
    restart_waybar
}

apply_current() {
    echo "OK: установлен current стиль (niri + matugen)"
    apply_variant "." config.jsonc modules.jsonc modules-dividers.jsonc colors.css style.css
}

apply_legacy() {
    echo "OK: установлен legacy стиль"
    apply_variant "legacy" config.jsonc modules.jsonc colors.css style.css
}

apply_v3() {
    echo "OK: установлен вариант 3 (current config + legacy style)"
    apply_variant "variant3-current-cfg-legacy-style" config.jsonc modules.jsonc modules-dividers.jsonc colors.css style.css
}

apply_v4() {
    echo "OK: установлен вариант 4 (legacy config + current style)"
    apply_variant "variant4-legacy-cfg-current-style" config.jsonc modules.jsonc colors.css style.css
}

apply_hybrid() {
    echo "OK: установлен вариант 5 (hybrid: legacy-модули + current-стиль)"
    apply_variant "hybrid" config.jsonc modules.jsonc colors.css style.css
}

case "${1:-menu}" in
    current|cur|1)
        apply_current
        ;;
    legacy|old|2)
        apply_legacy
        ;;
    v3|variant3|3)
        apply_v3
        ;;
    v4|variant4|4)
        apply_v4
        ;;
    hybrid|h|5)
        apply_hybrid
        ;;
    menu|"")
        echo "Выбери стиль waybar:"
        echo "  1) current — актуальный: niri-модули, matugen-цвета, разделители"
        echo "  2) legacy  — старый: hypr-модули, старые цвета"
        echo "  3) current config + legacy style"
        echo "  4) legacy config + current style"
        echo "  5) hybrid — legacy-модули + current-стиль"
        read -rp "> " choice
        case "$choice" in
            1|current) apply_current ;;
            2|legacy|old) apply_legacy ;;
            3|v3|variant3) apply_v3 ;;
            4|v4|variant4) apply_v4 ;;
            5|hybrid|h) apply_hybrid ;;
            *) echo "Неверный выбор" >&2; exit 1 ;;
        esac
        ;;
    *)
        echo "Неизвестный аргумент: $1" >&2
        echo "Использование: $0 [current|legacy|v3|v4|hybrid|menu]" >&2
        exit 1
        ;;
esac
