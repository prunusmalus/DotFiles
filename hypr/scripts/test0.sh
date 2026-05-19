#!/bin/bash

# --- НАСТРОЙКИ ---
OUTPUT_DIR="$HOME/Videos/Movies"
LOCK_FILE="/tmp/wf-recorder.lock"
LOG_FILE="/tmp/wf-recorder.log"

# ВАШЕ УСТРОЙСТВО (из вашего комментария)
# Мы объявим его как ЕДИНСТВЕННЫЙ источник для этой программы
TARGET_DEVICE="alsa_output.pci-0000_06_00.6.analog-stereo.monitor"

mkdir -p "$OUTPUT_DIR"

# --- 1. ОСТАНОВКА ЗАПИСИ ---
if [ -f "$LOCK_FILE" ]; then
    PID=$(cat "$LOCK_FILE")
    if ps -p "$PID" > /dev/null; then
        kill -SIGINT "$PID"
        # Ждем завершения
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

# --- ГЛАВНЫЙ ФИКС ---
# Мы устанавливаем переменную PULSE_SOURCE только для этой команды.
# wf-recorder будет думать, что это устройство по умолчанию.
# Флаг -a мы оставляем БЕЗ аргументов, чтобы он взял этот дефолт.
export PULSE_SOURCE="$TARGET_DEVICE"

# Запуск
wf-recorder -g "$SELECTION" -a -f "$FILENAME" --pixel-format yuv420p 2> "$LOG_FILE" &

PID=$!
sleep 1

# Проверка на мгновенный вылет
if ! ps -p "$PID" > /dev/null; then
    notify-send "Ошибка записи" "Смотри лог: $LOG_FILE" -u critical
    exit 1
fi

echo $PID > "$LOCK_FILE"
notify-send "Запись экрана" "Идет запись (PULSE_SOURCE)..."
