import { modulePlugin } from '@pulsesync/addon-sdk/vite'
import { defineConfig } from 'vite'

import { apiMajor } from './src/module-api.ts'

export default defineConfig({
    plugins: [modulePlugin({ apiMajor })],
})
