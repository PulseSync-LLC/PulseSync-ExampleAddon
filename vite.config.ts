import path from 'node:path'

import { defineAddonManifest, pulseSyncAddon } from '@pulsesync/addon-sdk/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

import addonConfig from './addon.config.mjs'
import { settings } from '@/settings.ts'

const manifest = defineAddonManifest(addonConfig)

export default defineConfig(({ mode }) => ({
    resolve: {
        alias: {
            '@': path.resolve(import.meta.dirname, 'src'),
        },
    },
    plugins: [
        react(),
        pulseSyncAddon({
            manifest,
            settings,
            minify: mode === 'development' ? false : 'oxc',
            ...(process.env.PULSESYNC_ADDON_OUT_DIR ? { outDir: process.env.PULSESYNC_ADDON_OUT_DIR } : {}),
        }),
    ],
}))
