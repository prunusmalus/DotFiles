#!/usr/bin/env bash
# install-deps.sh – Универсальный установщик с Flatpak fallback (только для GUI)

# Цвета
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# ---- Определение ОС и менеджера пакетов ----
detect_os() {
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS=$ID
    else
        OS=$(uname -s)
    fi
    echo "$OS"
}

detect_pm() {
    local os=$1
    case $os in
    arch | manjaro | endeavouros)
        PM="pacman"
        if command -v yay &>/dev/null; then
            AUR_HELPER="yay"
        elif command -v paru &>/dev/null; then
            AUR_HELPER="paru"
        else
            echo -e "${YELLOW}AUR helper not found. Installing yay...${NC}"
            sudo pacman -S --needed --noconfirm git base-devel
            git clone https://aur.archlinux.org/yay.git /tmp/yay
            cd /tmp/yay
            makepkg -si --noconfirm
            cd - >/dev/null
            AUR_HELPER="yay"
        fi
        ;;
    debian | ubuntu | pop | linuxmint)
        PM="apt"
        ;;
    fedora | rhel | centos)
        PM="dnf"
        ;;
    opensuse* | suse)
        PM="zypper"
        ;;
    alpine)
        PM="apk"
        ;;
    *)
        echo -e "${RED}Unsupported OS: $os${NC}"
        exit 1
        ;;
    esac
    echo "$PM"
}

# ---- Настройка Flatpak и Flathub ----
setup_flatpak() {
    if ! command -v flatpak &>/dev/null; then
        return 1
    fi
    if ! flatpak remotes 2>/dev/null | grep -q flathub; then
        echo -e "${YELLOW}Flathub remote not found. Adding...${NC}"
        flatpak remote-add --if-not-exists flathub https://flathub.org/repo/flathub.flatpakrepo 2>/dev/null
    fi
    return 0
}

# ---- Маппинг пакетов для Flatpak (только GUI-приложения) ----
declare -A FLATPAK_MAP=(
    ["firefox"]="org.mozilla.firefox"
    ["spotify"]="com.spotify.Client"
    ["discord"]="com.discordapp.Discord"
    ["slack"]="com.slack.Slack"
    ["obsidian"]="md.obsidian.Obsidian"
    ["zoom"]="us.zoom.Zoom"
    ["telegram-desktop"]="org.telegram.desktop"
)

# ---- Функция установки с fallback на Flatpak (только для GUI) ----
install_with_fallback() {
    local pkg=$1
    local pm=$2
    local aur_helper=$3

    # Попытка установить через системный менеджер
    local success=0
    case $pm in
    pacman)
        if sudo pacman -S --needed --noconfirm "$pkg" 2>/dev/null; then
            success=1
        fi
        ;;
    apt)
        if sudo apt install -y "$pkg" 2>/dev/null; then
            success=1
        fi
        ;;
    dnf)
        if sudo dnf install -y "$pkg" 2>/dev/null; then
            success=1
        fi
        ;;
    zypper)
        if sudo zypper install -y "$pkg" 2>/dev/null; then
            success=1
        fi
        ;;
    apk)
        if sudo apk add "$pkg" 2>/dev/null; then
            success=1
        fi
        ;;
    esac

    if [ $success -eq 1 ]; then
        echo -e "${GREEN}✅ Installed $pkg via $pm${NC}"
        return 0
    fi

    # ---- Flatpak fallback (только для явно указанных GUI-приложений) ----
    if setup_flatpak && [ -n "${FLATPAK_MAP[$pkg]}" ]; then
        local flatpak_id="${FLATPAK_MAP[$pkg]}"
        echo -e "${BLUE}Trying Flatpak: $flatpak_id${NC}"
        # Пробуем --user, затем --system
        if flatpak install --user -y flathub "$flatpak_id" 2>/dev/null; then
            echo -e "${GREEN}✅ Installed $pkg via Flatpak (user)${NC}"
            return 0
        elif flatpak install --system -y flathub "$flatpak_id" 2>/dev/null; then
            echo -e "${GREEN}✅ Installed $pkg via Flatpak (system)${NC}"
            return 0
        else
            echo -e "${RED}❌ Failed to install $pkg via Flatpak${NC}"
        fi
    fi

    echo -e "${YELLOW}⚠️  Skipping $pkg (not found in system repos and no Flatpak fallback)${NC}"
    return 1
}

# ---- Основная установка списка пакетов (пропускает ошибки) ----
install_packages_list() {
    local pm=$1
    local aur_helper=$2
    shift 2
    local packages=("$@")

    for pkg in "${packages[@]}"; do
        install_with_fallback "$pkg" "$pm" "$aur_helper" || true
    done
}

# ---- Установка AUR-пакетов (только Arch) ----
install_aur_packages() {
    local aur_helper=$1
    shift
    local packages=("$@")
    if [ ${#packages[@]} -eq 0 ]; then
        return
    fi
    echo -e "${GREEN}Installing AUR packages: ${packages[*]}${NC}"
    $aur_helper -S --needed --noconfirm "${packages[@]}" 2>/dev/null || echo -e "${YELLOW}⚠️  Some AUR packages failed to install${NC}"
}

# ---- Определение ОС и менеджера ----
OS=$(detect_os)
PM=$(detect_pm "$OS")
echo -e "${GREEN}Detected OS: $OS, Package Manager: $PM${NC}"

AUR_HELPER=""
if [ "$PM" = "pacman" ]; then
    if command -v yay &>/dev/null; then
        AUR_HELPER="yay"
    elif command -v paru &>/dev/null; then
        AUR_HELPER="paru"
    else
        echo -e "${YELLOW}Installing yay as AUR helper...${NC}"
        sudo pacman -S --needed --noconfirm git base-devel
        git clone https://aur.archlinux.org/yay.git /tmp/yay
        cd /tmp/yay
        makepkg -si --noconfirm
        cd - >/dev/null
        AUR_HELPER="yay"
    fi
    echo -e "${GREEN}AUR helper: $AUR_HELPER${NC}"
fi

# ---- Списки пакетов ----

# Базовые пакеты (общие)
BASE_PKGS=(
    git curl wget unzip zip xdg-user-dirs
    python3 python3-pip nodejs npm
    ripgrep fd-find fzf bat exa zoxide jq yq
    tree htop btop neofetch fastfetch duf ncdu
    rsync openssh network-manager bluez bluez-utils
    pulseaudio-utils pipewire pipewire-pulse wireplumber
    playerctl brightnessctl polkit polkit-gnome
    gnome-keyring libsecret
    imagemagick ffmpeg mpv
)

# Wayland/WM пакеты
WAYLAND_PKGS=(
    waybar swaync rofi kitty neovim yazi cava wlogout
    grim slurp wl-clipboard hyprpaper feh
)

# LSP и инструменты
LSP_PKGS=(
    gcc make cmake unzip npm python-pynvim
    ruby ruby-ripper-tags lua luajit luarocks tree-sitter
    shfmt stylua eslint prettier shellcheck yamlfmt yamllint markdownlint-cli2
    lua-language-server python-lsp-server pyright
    typescript-language-server vscode-json-languageserver
    vscode-html-languageserver yaml-language-server bash-language-server
)

# GUI-пакеты, которые могут быть в Flatpak (fallback)
FALLBACK_PKGS=(
    firefox
    spotify
    discord
    slack
    obsidian
    zoom
    telegram-desktop
)

# Для Arch – AUR-пакеты
AUR_PKGS=(
    niri cliphist swww bibata-cursor-theme-bin
    ttf-jetbrains-mono-nerd ttf-meslo-nerd
    ttf-font-awesome ttf-material-design-icons
    wlsunset wf-recorder pamixer pavucontrol pulsemixer
    starship spicetify-cli python-pywal
    catppuccin-gtk-theme everforest-gtk-theme gruvbox-gtk-theme tokyonight-gtk-theme
    kvantum-theme-catppuccin kvantum-theme-everforest kvantum-theme-gruvbox kvantum-theme-tokyonight
)

# ---- Установка ----

echo -e "${GREEN}Installing base packages...${NC}"
install_packages_list "$PM" "$AUR_HELPER" "${BASE_PKGS[@]}"

echo -e "${GREEN}Installing Wayland/WM packages...${NC}"
install_packages_list "$PM" "$AUR_HELPER" "${WAYLAND_PKGS[@]}"

echo -e "${GREEN}Installing LSP and Neovim tools...${NC}"
install_packages_list "$PM" "$AUR_HELPER" "${LSP_PKGS[@]}"

echo -e "${GREEN}Installing fallback packages (Flatpak)...${NC}"
install_packages_list "$PM" "$AUR_HELPER" "${FALLBACK_PKGS[@]}"

# ---- AUR-пакеты (только Arch) ----
if [ "$PM" = "pacman" ] && [ -n "$AUR_HELPER" ]; then
    install_aur_packages "$AUR_HELPER" "${AUR_PKGS[@]}"
fi

# ---- Python и npm (глобальные) ----
echo -e "${GREEN}Installing Python packages via pip...${NC}"
pip3 install --user requests beautifulsoup4 lxml pillow pywal dbus-python pulsectl 2>/dev/null || echo -e "${YELLOW}⚠️  Some Python packages failed to install${NC}"

echo -e "${GREEN}Installing npm global packages...${NC}"
npm install -g @fsouza/prettierd @olrtg/emmet-language-server 2>/dev/null || echo -e "${YELLOW}⚠️  Some npm packages failed to install${NC}"

# ---- Итоговые инструкции ----
if [ "$PM" != "pacman" ]; then
    echo -e "${YELLOW}Hyprland and Niri may not be available in your repositories.${NC}"
    echo -e "${YELLOW}Please consider compiling them manually:${NC}"
    echo "  - Hyprland: https://github.com/hyprwm/Hyprland"
    echo "  - Niri: https://github.com/YaLTeR/niri"
fi

echo -e "${GREEN}All packages processed.${NC}"
echo -e "${GREEN}Don't forget to deploy your dotfiles using 'stow'.${NC}"
