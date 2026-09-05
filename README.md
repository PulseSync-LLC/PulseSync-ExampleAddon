# PulseSync Addon Template

Шаблон React-аддона для PulseSync на TypeScript, Vite и `@pulsesync/addon-sdk`.

## Быстрый старт

Требования: Node.js 20+, Yarn, актуальные версии PulseSync и мода.

```bash
yarn install
yarn dev
```

`yarn dev` автоматически пересобирает и устанавливает аддон при изменении исходных файлов, затем отправляет запрос на перезагрузку аддона. Для применения изменений PulseSync и Яндекс Музыка должны быть запущены.

## Структура проекта

- `addon.config.mjs` — ID, имя, автор, версия и разрешённые адреса `allowedUrls`. Для нового аддона необходимо указать собственные `id` и `directoryName`.
- `src/main.tsx` — логика и интерфейс аддона. В примере кнопка плеера открывает форму заметки, сохраняет данные и показывает уведомление; пункт меню трека показывает его ID.
- `src/settings.ts` — типизированные настройки; в React доступны через `settings.use()`.
- `addon/` — статические файлы аддона.
- `vite.config.ts` — сборка через плагин SDK.

## Минимальный аддон

```tsx
import { defineAddon, IconButton, notifications } from '@pulsesync/addon-sdk'

import addonConfig from '../addon.config.mjs'

function PlayerButton() {
    return (
        <IconButton
            icon="info"
            label="Показать уведомление"
            onClick={() => notifications.info('Аддон работает')}
        />
    )
}

export default defineAddon({
    id: addonConfig.id,
    slots: { playerBarButton: PlayerButton },
})
```

WebHost предоставляет React и рендерит компоненты: `react-dom` и `createRoot()` не нужны. Сервисы SDK вызываются в обработчиках, компонентах и `start`, а не при импорте модуля. API и примеры — в [документации SDK](https://www.npmjs.com/package/@pulsesync/addon-sdk).

## Команды

| Команда | Действие |
| --- | --- |
| `yarn dev` | Сборка при изменениях, установка и запрос перезагрузки аддона |
| `yarn build` | Сборка в `dist/<directoryName>` без установки |
| `yarn sync` | Установка готовой сборки с сохранением пользовательских настроек |
| `yarn build:sync` | Сборка и установка |
| `yarn format` | Форматирование файлов проекта |

Каталог установки задаётся переменной окружения `PULSESYNC_ADDONS_DIR`. Если клиент недоступен, установленная сборка загружается при следующем запуске.

## Лицензия

PulseSync Addon Development License 1.1: [русский текст](./LICENSE.ru.md) · [English](./LICENSE). При расхождениях применяется русская версия в пределах, допускаемых законом.

Copyright © 2026 Матвиенко Артём Евгеньевич.
Все права защищены.
