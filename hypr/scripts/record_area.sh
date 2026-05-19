#!/bin/bash

OUTPUT_DIR="$HOME/Videos/Movies"
# Проверяем, существует ли папка, и создаем ее, если нет
mkdir -p "$OUTPUT_DIR"

# Определяем путь к файлу блокировки для отслеживания состояния записи
LOCK_FILE="/tmp/wf-recorder.lock"

# 1. Если файл блокировки существует, запись идет, и мы должны ее остановить.
if [ -f "$LOCK_FILE" ]; then
    # Получаем PID процесса wf-recorder и отправляем ему сигнал завершения (SIGINT)
    kill -SIGINT $(cat "$LOCK_FILE")
    # Удаляем файл блокировки
    rm "$LOCK_FILE"
    # Оповещение (опционально)
    notify-send "Запись экрана" "Запись остановлена."
    exit 0
fi

# 2. Если файл блокировки НЕ существует, начинаем новую запись.

# Запрашиваем у пользователя выбор области с помощью slurp
SELECTION=$(slurp)

# Проверяем, была ли выбрана область (если пользователь не отменил)
if [ -z "$SELECTION" ]; then
    notify-send "Запись экрана" "Выбор области отменен."
    exit 1
fi

TIMESTAMP=$(date +%Y-%m-%d_%H-%M-%S)
FILENAME="$OUTPUT_DIR/ScreenRecording_$TIMESTAMP.mp4"

# Запускаем wf-recorder в фоновом режиме (&)
# -g "$SELECTION" : записывает выбранную область
# -f "$FILENAME"  : сохраняет в указанный файл
wf-recorder -g "$SELECTION" -f "$FILENAME" &

# Сохраняем PID запущенного процесса в файл блокировки
echo $! > "$LOCK_FILE"

# Оповещение (опционально)
notify-send "Запись экрана" "Начата запись области в $FILENAME"
