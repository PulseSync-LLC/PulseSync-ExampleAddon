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

- `yarn dev` — собирает аддон прямо в локальную папку PulseSync и следит за изменениями;
- `yarn build` — создаёт готовый аддон в `dist/pulsesync-template`;
- `yarn sync` — копирует готовую сборку в PulseSync;
- `yarn build:sync` — собирает и копирует одной командой.

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
