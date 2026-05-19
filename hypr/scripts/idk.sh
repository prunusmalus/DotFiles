#!/bin/bash

# --- НАСТРОЙКИ ---
OUTPUT_DIR="$HOME/Videos/Movies"
LOCK_FILE="/tmp/wf-recorder.lock"
LOG_FILE="/tmp/wf-recorder.log"

mkdir -p "$OUTPUT_DIR"

# --- 1. ОСТАНОВКА ЗАПИСИ ---
if [ -f "$LOCK_FILE" ]; then
    PID=$(cat "$LOCK_FILE")
    if ps -p "$PID" > /dev/null; then
        kill -SIGINT "$PID"
        while ps -p "$PID" > /dev/null; do sleep 0.1; done
    fi
    rm "$LOCK_FILE"
    notify-send "Запись экрана" "Запись сохранена."
    exit 0
fi

# --- 2. НАЧАЛО ЗАПИСИ ---

SELECTION=$(slurp)
if [ -z "$SELECTION" ]; then
    notify-send "Запись экрана" "Отменено."
    exit 1
fi

TIMESTAMP=$(date +%Y-%m-%d_%H-%M-%S)
FILENAME="$OUTPUT_DIR/ScreenRecording_$TIMESTAMP.mp4"

# --- ГЛАВНЫЙ ФИКС (АВТОМАТИКА) ---
# 1. Получаем имя текущего устройства вывода (куда идет звук прямо сейчас)
CURRENT_SINK=$(pactl get-default-sink)

# 2. Добавляем к нему .monitor (чтобы писать выходной звук, а не микрофон)
# Это работает для любого устройства (наушники, HDMI, колонки)
export PULSE_SOURCE="${CURRENT_SINK}.monitor"

# Запуск
wf-recorder -g "$SELECTION" -a -f "$FILENAME" --pixel-format yuv420p 2> "$LOG_FILE" &

PID=$!
sleep 1

# Проверка на ошибки
if ! ps -p "$PID" > /dev/null; then
    notify-send "Ошибка записи" "Смотри лог: $LOG_FILE" -u critical
    exit 1
fi

echo $PID > "$LOCK_FILE"
notify-send "Запись экрана" "Идет запись (Системный звук)..."
