#!/bin/bash

# Путь для сохранения файла.
RECORDINGS_DIR="$HOME/Videos/Recordings"
mkdir -p "$RECORDINGS_DIR"

# Имя файла с датой и временем. Изменено на MKV.
FILENAME="screencast-$(date +%Y-%m-%d_%H-%M-%S).mkv"
FILE_PATH="$RECORDINGS_DIR/$FILENAME"

# Проверяем, запущен ли уже wf-recorder
if pgrep -x "wf-recorder" > /dev/null; then
    pkill -INT wf-recorder
    notify-send "Запись экрана" "Запись остановлена. Файл сохранен в $FILE_PATH" -t 5000
else
    # Используем кодек VP8 (libvpx).
    wf-recorder -g "$(slurp)" -c libvpx -f "$FILE_PATH" &

    # Отправляем уведомление
    notify-send "Запись экрана" "Запись области запущена (MKV/VP8). Нажмите Super + Shift + D для остановки."
fi