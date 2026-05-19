#!/bin/bash

# Файл для хранения ID последнего обработанного окна (чтобы не дублировать действия)
LAST_ID_FILE="/tmp/niri_last_win_id"
echo "" > "$LAST_ID_FILE"

echo "Слушаю события Niri..."

# Запускаем поток событий
niri msg -j event-stream | while read -r line; do
    # Ищем событие WindowOpenedOrChanged
    if echo "$line" | grep -q "WindowOpenedOrChanged"; then
        
        # Извлекаем ID окна
        ID=$(echo "$line" | jq -r '.WindowOpenedOrChanged.id')
        LAST_ID=$(cat "$LAST_ID_FILE")

        # Если это то же самое окно (просто сменился заголовок), пропускаем
        if [ "$ID" == "$LAST_ID" ]; then continue; fi
        echo "$ID" > "$LAST_ID_FILE"

        # Считаем количество колонок на активном воркспейсе
        # Мы берем активный воркспейс и считаем длину массива columns
        COUNT=$(niri msg -j workspaces | jq '[.[] | select(.is_focused == true) | .columns[]] | length')

        echo "Новое окно (ID: $ID). Всего колонок на воркспейсе: $COUNT"

        if [ "$COUNT" -eq 1 ]; then
            echo "Окно единственное — ставим ширину 100%"
            # Используем явную установку ширины, это надежнее чем maximize
            niri msg action set-column-width "100%"
        else
            echo "Окон несколько — оставляем стандартную ширину"
        fi
    fi
done
