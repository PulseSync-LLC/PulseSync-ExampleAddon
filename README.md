# PulseSync Addon Template

Шаблон `script`-аддона для PulseSync.

Точка входа: `src/main.ts`.
`addon/` копируется в итоговую папку как есть.

Сборка кладёт в папку аддона:

- `metadata.json`
- `script.js`
- `script.css`
- `handleEvents.json`
- `README.md`
- `Assets/*`

## Команды

```bash
yarn
yarn dev
yarn build
yarn sync
yarn build:sync
```

- `yarn dev` пишет сразу в папку аддонов PulseSync
- `yarn build` собирает в `dist/pulsesync-vite-template`
- `yarn sync` копирует `dist`-сборку в папку аддонов
- `yarn build:sync` делает `build` и `sync`

Обычно достаточно `yarn dev`, если нужно сразу проверять аддон в клиенте.
`yarn dev` собирает без минификации, `yarn build` собирает с минификацией.

## Папка аддонов

- Windows: `%APPDATA%/PulseSync/addons`
- macOS: `~/Library/Application Support/PulseSync/addons`
- Linux: `$XDG_CONFIG_HOME/PulseSync/addons` или `~/.config/PulseSync/addons`
- override: `PULSESYNC_ADDONS_DIR`

## Структура проекта

```text
src/
  main.ts              точка входа
  pulsesync.ts         хелперы для PulseSync API
  styles.css           стили аддона
  template/
    constants.ts
    dom.ts
    render.ts
    mount.ts
addon/
  handleEvents.json
  README.md
  Assets/
scripts/
  dev-build.mjs        watch-сборка в папку аддонов
  sync-addon.mjs       копирование `dist`-сборки
  pulsesync-paths.mjs  резолв пути до папки PulseSync
addon.config.mjs
vite.config.ts
```
