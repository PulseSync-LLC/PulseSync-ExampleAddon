# PulseSync React Addon Template

Минимальный шаблон React-аддона для PulseSync.

## Быстрый старт

```bash
yarn
yarn dev
```

Открой `src/main.tsx` и замени демонстрационный компонент своим:

```tsx
import { defineAddon, type PulseSyncAddonComponentProps, YandexMusicIcon } from '@pulsesync/addon-sdk'

function MyAddon({ api }: PulseSyncAddonComponentProps) {
    return (
        <button
            title="Показать уведомление"
            data-pulsesync-tooltip-description="Тестовое уведомление через PulseSync API"
            onClick={() => void api.notifications.show('Аддон работает')}
        >
            <YandexMusicIcon name="info" size="xxs" />
        </button>
    )
}

export default defineAddon({
    id: 'my-addon',
    slots: {
        playerBarButton: MyAddon,
    },
})
```

WebHost сам рендерит компонент. Вызывать `createRoot()` и устанавливать `react-dom` не нужно.

## Настройки

Настройки описываются типизированно в `src/settings.ts`:

```tsx
import { defineAddonSettings, SettingType } from '@pulsesync/addon-sdk'

export const settings = defineAddonSettings({
    enabled: {
        type: SettingType.BOOLEAN,
        name: 'Включить аддон',
        default: true,
    },
})
```

Передай `settings` в `defineAddon()` и `pulseSyncAddon()` внутри `vite.config.ts`, а в компоненте используй `settings.use()`. В обычном коде доступен readonly-снимок `settings.store`. SDK сам выводит типы значений и добавляет схему в `metadata.json`; отдельный `handleEvents.json` новому аддону не нужен.

## Команды

- `yarn dev` - следит за исходниками, безопасно доставляет завершённую сборку в PulseSync, включает аддон и запрашивает его перезагрузку;
- `yarn build` - создаёт готовый аддон в `dist/pulsesync-template`;
- `yarn sync` - безопасно устанавливает готовую сборку в PulseSync и сохраняет пользовательские настройки;
- `yarn build:sync` - собирает и копирует одной командой.

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

Метаданные находятся в `addon.config.mjs`, стили - в `src/styles.css`, статические файлы - в `addon/`.

## License

Код и материалы PulseSync в этом репозитории распространяются по лицензии **PulseSync Addon Development License 1.1**.

Лицензия разрешает использовать и изменять эти материалы для разработки аддонов PulseSync, в том числе коммерческих и с закрытым исходным кодом. Код, который разработчик написал самостоятельно и который не основан на коде PulseSync, остается за разработчиком.

Код PulseSync и его производные части нельзя переносить в сторонние приложения, общие ядра многоплатформенных проектов, альтернативные SDK, фреймворки, шаблоны, инструменты разработки или самостоятельные сетевые сервисы, если на это нет отдельного письменного разрешения.

Полный текст лицензии:

- [`LICENSE`](./LICENSE) - английская версия
- [`LICENSE.ru.md`](./LICENSE.ru.md) - русская версия

Обе версии являются официальными. Если между ними есть расхождение, применяется русская версия в пределах, допускаемых законом.

Copyright © 2026 Матвиенко Артём Евгеньевич.
Все права защищены, кроме прямо предоставленных лицензией.
