# PulseSync React Addon Template

Минимальный шаблон React-аддона для PulseSync.

## Быстрый старт

```bash
yarn
yarn dev
```

Открой `src/main.tsx` и замени демонстрационный компонент своим:

```tsx
import { defineAddon } from '@pulsesync/addon-sdk'

function MyAddon() {
    return <button>Мой аддон</button>
}

export default defineAddon({
    id: 'my-addon',
    component: MyAddon,
})
```

WebHost сам рендерит компонент. Вызывать `createRoot()` и устанавливать `react-dom` не нужно.

## Настройки

Настройки описываются типизированно в `src/settings.ts`:

```tsx
export const settings = defineSettings({
    enabled: {
        type: 'boolean',
        name: 'Включить аддон',
        default: true,
    },
})
```

Передай `settings` в `pulseSyncAddon()` внутри `vite.config.ts`, а в компоненте используй `settings.use(api)`. SDK сам добавит схему в `metadata.json`; отдельный `handleEvents.json` новому аддону не нужен.

## Команды

- `yarn dev` — следит за исходниками, безопасно доставляет завершённую сборку в PulseSync, включает аддон и запрашивает его перезагрузку;
- `yarn build` — создаёт готовый аддон в `dist/pulsesync-template`;
- `yarn sync` — безопасно устанавливает готовую сборку в PulseSync и сохраняет пользовательские настройки;
- `yarn build:sync` — собирает и копирует одной командой.

`yarn dev` собирает сначала во временную папку проекта, поэтому Vite не очищает установленный аддон. После завершения сборки шаблон сохраняет созданный клиентом `pulsesync.settings.json`, заменяет файлы аддона и обращается к локальному PulseSync. В терминале видно, принял ли клиент обновление и есть ли подключённое окно Яндекс Музыки.

Если PulseSync не запущен или ещё не поддерживает development reload, сборка всё равно устанавливается и будет подхвачена при следующем запуске. Путь можно переопределить через `PULSESYNC_ADDONS_DIR`.

## Куда рендерить компонент

Обычный компонент:

```tsx
defineAddon({
    id: 'my-addon',
    component: MyAddon,
})
```

Стандартная точка WebHost:

```tsx
defineAddon({
    id: 'my-addon',
    slots: {
        playerBarButton: PlayerButton,
    },
})
```

Собственная DOM-цель:

```tsx
defineAddon({
    id: 'my-addon',
    mounts: [
        {
            target: '[data-test-id="PLAYERBAR_DESKTOP"]',
            component: PlayerButton,
        },
    ],
})
```

Метаданные находятся в `addon.config.mjs`, стили — в `src/styles.css`, статические файлы — в `addon/`.
