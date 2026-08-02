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

# =============================================================================
#
# Utility functions for zoxide.
#

# pwd based on the value of _ZO_RESOLVE_SYMLINKS.
function __zoxide_pwd
    builtin pwd -L
end

# A copy of fish's internal cd function. This makes it possible to use
# `alias cd=z` without causing an infinite loop.
if ! builtin functions --query __zoxide_cd_internal
    if status list-files functions/cd.fish &>/dev/null
        status get-file functions/cd.fish | string replace --regex -- '^function cd\s' 'function __zoxide_cd_internal ' | source
    else
        string replace --regex -- '^function cd\s' 'function __zoxide_cd_internal ' <$__fish_data_dir/functions/cd.fish | source
    end
end

# cd + custom logic based on the value of _ZO_ECHO.
function __zoxide_cd
    if set -q __zoxide_loop
        builtin echo "zoxide: infinite loop detected"
        builtin echo "Avoid aliasing `cd` to `z` directly, use `zoxide init --cmd=cd fish` instead"
        return 1
    end
    __zoxide_loop=1 __zoxide_cd_internal $argv
end

# =============================================================================
#
# Hook configuration for zoxide.
#

# Initialize hook to add new entries to the database.
function __zoxide_hook --on-variable PWD
    test -z "$fish_private_mode"
    and command zoxide add -- (__zoxide_pwd)
end

# =============================================================================
#
# When using zoxide with --no-cmd, alias these internal functions as desired.
#

# Jump to a directory using only keywords.
function __zoxide_z
    set -l argc (builtin count $argv)
    if test $argc -eq 0
        __zoxide_cd $HOME
    else if test "$argv" = -
        __zoxide_cd -
    else if test $argc -eq 1 -a -d $argv[1]
        __zoxide_cd $argv[1]
    else if test $argc -eq 2 -a $argv[1] = --
        __zoxide_cd -- $argv[2]
    else
        set -l result (command zoxide query --exclude (__zoxide_pwd) -- $argv)
        and __zoxide_cd $result
    end
end

# Completions.
function __zoxide_z_complete
    set -l tokens (builtin commandline --current-process --tokenize)
    set -l curr_tokens (builtin commandline --cut-at-cursor --current-process --tokenize)

    if test (builtin count $tokens) -le 2 -a (builtin count $curr_tokens) -eq 1
        # If there are < 2 arguments, use `cd` completions.
        complete --do-complete "'' "(builtin commandline --cut-at-cursor --current-token) | string match --regex -- '.*/$'
    else if test (builtin count $tokens) -eq (builtin count $curr_tokens)
        # If the last argument is empty, use interactive selection.
        set -l query $tokens[2..-1]
        set -l result (command zoxide query --exclude (__zoxide_pwd) --interactive -- $query)
        and __zoxide_cd $result
        and builtin commandline --function cancel-commandline repaint
    end
end
complete --command __zoxide_z --no-files --arguments '(__zoxide_z_complete)'

# Jump to a directory using interactive search.
function __zoxide_zi
    set -l result (command zoxide query --interactive -- $argv)
    and __zoxide_cd $result
end

# =============================================================================
#
# Commands for zoxide. Disable these using --no-cmd.
#

abbr --erase z &>/dev/null
complete --erase --command z
alias z=__zoxide_z

abbr --erase zi &>/dev/null
complete --erase --command zi
alias zi=__zoxide_zi

# =============================================================================
#
# To initialize zoxide, add this to your configuration (usually
# ~/.config/fish/config.fish):
#
#   zoxide init fish | source
