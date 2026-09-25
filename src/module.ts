import { defineModule } from '@pulsesync/addon-sdk'

import { apiMajor, type ModuleExports } from './module-api.ts'

defineModule<ModuleExports>({
    apiMajor,
    create({ signal }) {
        return {
            exports: {
                formatLabel(value) {
                    signal.throwIfAborted()
                    return `PulseSync: ${value.trim()}`
                },
            },
        }
    },
})
