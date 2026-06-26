# 🌌 prunus' Dotfiles

![Arch Linux](https://img.shields.io/badge/OS-Arch%20Linux-blue?logo=arch-linux&logoColor=white&style=flat-square)
![Shell](https://img.shields.io/badge/shell-fish-crimson?logo=fish&logoColor=white&style=flat-square)
![WM/Compositor](https://img.shields.io/badge/compositor-niri%20%7C%20hyprland-purple?style=flat-square)
![Stow](https://img.shields.io/badge/stow-flat%20structure-green?style=flat-square)

Welcome to my dotfiles repository! This is a collection of my personal configuration files for an **Arch Linux** environment powered by the **Niri** and **Hyprland** tiling compositors.

This repository is designed using a **flat GNU Stow structure**. This means there is no redundant nesting like `.config/program_name/` inside the repository; the clean configuration files live right in the root directory of each package.

---

## Dependencies

- `niri` or `hyprland`
- `kitty`, `waybar`, `swaync`, `rofi`
- `fish` (or your preferred shell)
- `feh` or `swww` (depending on your wallpaper script)
- `polkit-gnome` or `mate-polkit`
- `brightnessctl`, `wpctl` (for audio/brightness)

  ***

## 📂 Repository Structure

Each folder represents an independent configuration package:

- **Compositors / WM:** `niri`, `hypr`
- **Terminal & Shell:** `kitty`, `fish`
- **Bars & Notifications:** `waybar`, `swaync`
- **Menus & Launchers:** `rofi`, `niripwmenu`, `wlogout`
- **Look & Feel / Themes:** `gtk-3.0`, `gtk-4.0`, `gtk-themes`, `Kvantum`, `qt5ct`, `qt6ct`, `nwg-look`
- **Utilities & Media:** `nvim` (Text editor), `yazi` (File manager), `cava` (Audio visualizer), `quickshell`
- **Themed Apps:** `BetterDiscord`, `spicetify` (Spotify), `zen` (Browser)
- **Misc:** `misc`

---

## 🛠️ Installation & Linking (GNU Stow)

Since this repository uses a flat structure, the standard `stow */` command **should not be used**, as it would link files directly into the root of your home directory.

Instead, each package must be deployed directly to its specific target destination using the `-t` (`--target`) flag.

### 1. Installing a Single Package

To apply the configuration for a specific program (e.g., `niri`), run:

```bash
cd ~/DotFiles
rm -rf ~/.config/niri && mkdir -p ~/.config/niri
stow -t ~/.config/niri niri

```
