import { modulePlugin } from '@pulsesync/addon-sdk/vite'
import { defineConfig } from 'vite'

export default defineConfig({
    plugins: [modulePlugin()],
})
