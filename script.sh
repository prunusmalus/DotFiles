#!/usr/bin/env bash
# =============================================================================
# prunus' Dotfiles — универсальный установщик
#
# Сочетает в себе:
#   1. Установку зависимостей (через install-deps.sh)
#   2. Развёртывание дотфайлов через GNU Stow (безопасно, с бэкапом)
#   3. Выбор стиля fish и waybar (через choose-style.sh)
#
# Использование:
#   ./script.sh            — всё по очереди (спросит подтверждение)
#   ./script.sh --deps     — только зависимости
#   ./script.sh --deploy   — только развернуть дотфайлы
#   ./script.sh --styles   — только выбрать стиль fish/waybar
# =============================================================================
set -euo pipefail

DOTFILES_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DOTFILES_DIR"

# ---- Цвета ----
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

say()  { echo -e "${GREEN}==>${NC} $*"; }
info() { echo -e "${BLUE}  ->${NC} $*"; }
warn() { echo -e "${YELLOW}  !!${NC} $*"; }
err()  { echo -e "${RED}  !!${NC} $*" >&2; }

confirm() {
    local prompt="${1:-Продолжить?}"
    local ans
    read -rp "$prompt [y/N] " ans
    case "$ans" in
        y|Y|yes|Yes|YES) return 0 ;;
        *) return 1 ;;
    esac
}

need_cmd() {
    if ! command -v "$1" >/dev/null 2>&1; then
        err "Не найдена команда '$1'. Установи её или добавь в PATH."
        return 1
    fi
    return 0
}

# =============================================================================
# 1. ЗАВИСИМОСТИ
# =============================================================================
install_deps() {
    say "Установка зависимостей"
    if [ -x "$DOTFILES_DIR/install-deps.sh" ]; then
        "$DOTFILES_DIR/install-deps.sh"
    else
        warn "install-deps.sh не найден — пропускаю зависимости"
    fi
}

# =============================================================================
# 2. РАЗВЁРТЫВАНИЕ ДОТФАЙЛОВ
# =============================================================================
# Карта «пакет -> целевая директория».
# Все каталоги с конфигами перечислены явно, чтобы stow не трогал лишнего.
declare -A TARGETS=(
    # Композиторы / WM
    [niri]="$HOME/.config/niri"
    [hypr]="$HOME/.config/hypr"
    [bspwm]="$HOME/.config/bspwm"
    [driftwm]="$HOME/.config/driftwm"
    [quickshell]="$HOME/.config/quickshell"
    # Терминал и шелл
    [kitty]="$HOME/.config/kitty"
    [fish]="$HOME/.config/fish"
    # Бары и уведомления
    [waybar]="$HOME/.config/waybar"
    [swaync]="$HOME/.config/swaync"
    # Меню и лаунчеры
    [rofi]="$HOME/.config/rofi"
    [niripwmenu]="$HOME/.config/niripwmenu"
    [wlogout]="$HOME/.config/wlogout"
    # Look & Feel
    [gtk-3.0]="$HOME/.config/gtk-3.0"
    [gtk-4.0]="$HOME/.config/gtk-4.0"
    [Kvantum]="$HOME/.config/Kvantum"
    [qt5ct]="$HOME/.config/qt5ct"
    [qt6ct]="$HOME/.config/qt6ct"
    [nwg-look]="$HOME/.config/nwg-look"
    # Утилиты и медиа
    [nvim]="$HOME/.config/nvim"
    [yazi]="$HOME/.config/yazi"
    [cava]="$HOME/.config/cava"
    [clipcat]="$HOME/.config/clipcat"
    # Тематизированные приложения
    [BetterDiscord]="$HOME/.config/BetterDiscord"
    [spicetify]="$HOME/.config/spicetify"
    [zen]="$HOME/.zen"
)

# Специальные пакеты, которые не стоуятся (или требуют особого подхода)
SKIP_PKGS=(
    "gtk-themes"   # пустой каталог-заглушка
    "misc"         # пустой каталог-заглушка
)

is_skipped() {
    local pkg="$1" p
    for p in "${SKIP_PKGS[@]}"; do
        [ "$p" = "$pkg" ] && return 0
    done
    return 1
}

# Бэкапит файлы, мешающие stow, и кладёт количество в глобальную переменную
BACKED_UP_COUNT=0
backup_conflicts() {
    local pkg="$1" target="$2" backup="$3"
    local pkg_abs="$DOTFILES_DIR/$pkg"
    local f rel
    BACKED_UP_COUNT=0
    while IFS= read -r f; do
        rel="${f#"$pkg_abs/"}"
        if [ -e "$target/$rel" ] || [ -L "$target/$rel" ]; then
            mkdir -p "$backup/$pkg/$(dirname "$rel")"
            mv -f "$target/$rel" "$backup/$pkg/$rel" 2>/dev/null || true
            BACKED_UP_COUNT=$((BACKED_UP_COUNT + 1))
        fi
    done < <(find "$pkg_abs" -type f 2>/dev/null)
}

deploy_pkg() {
    local pkg="$1" target="$2" backup="$3"
    if [ ! -d "$pkg" ]; then
        return 0
    fi
    # Пропускаем пустые каталоги
    if [ -z "$(find "$pkg" -mindepth 1 -print -quit 2>/dev/null)" ]; then
        info "Пропускаю пустой пакет: $pkg"
        return 0
    fi
    is_skipped "$pkg" && { info "Пропускаю (в SKIP_PKGS): $pkg"; return 0; }

    mkdir -p "$target"
    if stow --no-folding -t "$target" "$pkg" 2>/dev/null; then
        info "OK: $pkg -> $target"
        return 0
    fi

    # Конфликт — бэкапим и пробуем снова
    backup_conflicts "$pkg" "$target" "$backup"
    if stow --no-folding -t "$target" "$pkg" 2>/dev/null; then
        if [ "$BACKED_UP_COUNT" -gt 0 ]; then
            warn "$pkg: конфликтующие файлы перенесены в $backup/$pkg ($BACKED_UP_COUNT шт.)"
        fi
        info "OK: $pkg -> $target"
    else
        err "$pkg: не удалось развернуть даже после бэкапа. Пропускаю."
    fi
}

deploy_dotfiles() {
    say "Развёртывание дотфайлов (GNU Stow)"
    need_cmd stow || return 1

    local backup_dir="$HOME/.dotfiles-backup-$(date +%Y%m%d-%H%M%S)"
    mkdir -p "$backup_dir"
    info "Бэкап конфликтов: $backup_dir"

    local pkg target
    for pkg in "${!TARGETS[@]}"; do
        target="${TARGETS[$pkg]}"
        deploy_pkg "$pkg" "$target" "$backup_dir"
    done

    say "Готово. Конфликтующие старые файлы сохранены в $backup_dir"
}

# =============================================================================
# 3. ВЫБОР СТИЛЯ (fish / waybar)
# =============================================================================
choose_styles() {
    say "Выбор стиля fish и waybar"
    if [ -x "$DOTFILES_DIR/choose-style.sh" ]; then
        "$DOTFILES_DIR/choose-style.sh"
    else
        warn "choose-style.sh не найден — пропускаю выбор стиля"
    fi
}

# =============================================================================
# MAIN
# =============================================================================
usage() {
    echo "Использование: $0 [--deps|--deploy|--styles|--all]"
    echo "  --deps     только установить зависимости"
    echo "  --deploy   только развернуть дотфайлы"
    echo "  --styles   только выбрать стиль fish/waybar"
    echo "  --all      выполнить всё по очереди (по умолчанию)"
    exit 0
}

main() {
    local mode="${1:---all}"

    case "$mode" in
        --deps)
            install_deps
            ;;
        --deploy)
            deploy_dotfiles
            ;;
        --styles)
            choose_styles
            ;;
        --all|"")
            echo -e "${BOLD}prunus' Dotfiles — установщик${NC}"
            echo
            echo "Будут выполнены:"
            echo "  1. Установка зависимостей"
            echo "  2. Развёртывание дотфайлов"
            echo "  3. Выбор стиля fish / waybar"
            echo
            confirm "Начать?" || { info "Отменено."; exit 0; }
            install_deps || true
            deploy_dotfiles || true
            choose_styles || true
            say "Всё готово. Перезапусти шелл (exec fish) и проверь конфиги."
            ;;
        -h|--help|help)
            usage
            ;;
        *)
            err "Неизвестный аргумент: $mode"
            usage
            ;;
    esac
}

main "${1:---all}"
