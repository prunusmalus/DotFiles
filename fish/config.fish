##########################################
#####----------- Shell ------------#####-#
########################################-#
###----------------------------------###-#
##---- ~/.config/fish/config.fish ----##-#
###----------------------------------###-#
########################################-#
#####---------- Exports ----------######-#
##########################################

set -gx EDITOR nvim
set -gx VISUAL nvim

set -gx CMAKE_PREFIX_PATH /opt/homebrew/opt/llvm # LLVM
set -gx LDFLAGS -L/opt/homebrew/opt/llvm/lib # LLVM
set -gx CPPFLAGS -I/opt/homebrew/opt/llvm/include # LLVM

fish_add_path /opt/homebrew/opt/llvm/bin # LLVM
fish_add_path /opt/homebrew/opt/qt@5/bin # QT5
fish_add_path /opt/homebrew/opt/qt@6/bin # QT6
fish_add_path /opt/homebrew/bin # Homebrew
fish_add_path $HOME/.dotnet/tools # .NET tools
fish_add_path /Users/solyer/.dotnet/tools # .NET tools

########################################
#####---------- Autojump ----------#####
########################################

if test -f /opt/homebrew/share/autojump/autojump.fish
    source /opt/homebrew/share/autojump/autojump.fish
end

#######################################
#####---------- Aliases ----------#####
#######################################

alias nefetch='neofetch'
alias nfetch='neofetch'
alias nf='neofetch'
alias ay='AyuGram'

alias ff='fastfetch'

alias bb='btop'
alias bp='btop'

alias gs='git status'
alias ga='git add'
alias gc='git commit'
alias gp='git push'
alias gl='git log --oneline --graph --decorate'

alias nivm='nvim'
alias nvi='nvim'
alias nv='nvim'
alias niv='nvim'
alias vimn='nvim'
alias vmin='nivm'
alias n='nivm'

alias ls='eza --icons=always --group-directories-first -A' # Swap LS
alias ll='eza --icons=always --group-directories-first -lA --git --time-style=relative'
alias lt='eza --icons=always --tree --level=2 -A'
alias ltt='eza --icons=always --tree --level=3 -A'
alias ddd='discord'

alias ds='cd'
alias c='clear'
alias ..='cd ..'
alias syu='sudo pacman -Syu'


alias e='exit'

alias mkdir='mkdir -p'
alias grep='grep --color=auto'
alias cat='bat --style=plain --paging=never' # Swap CAT

###################################
#####---------- Eza ----------#####
###################################

set -gx LS_COLORS "di=1;34:ln=1;36:ex=1;32:*.md=1;33:*.toml=0;33:*.json=0;36:*.cpp=1;35:*.h=1;35:*.py=1;33:*.rs=1;31:*.go=1;36:*.sh=1;32"
set -gx EZA_COLORS "$LS_COLORS:da=2;37:sn=1;37:sb=0;37:uu=1;33:un=1;31:gu=1;33:gn=1;31"

################################################
#####---------- Startup commands ----------#####
################################################

if status is-interactive
    fastfetch --config hypr/hichan.jsonc
    #neofetch
    starship init fish | source # Starship
end

######################################
#####---------- Ranger ----------#####
######################################

function ranger
    set -l temp_file (mktemp -t "ranger_cd.XXXXXXXXXX")
    command ranger --choosedir=$temp_file $argv
    if test -f $temp_file
        set -l last_dir (cat $temp_file)
        if test -n "$last_dir" -a "$last_dir" != (pwd)
            cd $last_dir
        end
    end
    rm -f $temp_file
end

fish_add_path /home/prunus/.spicetify
