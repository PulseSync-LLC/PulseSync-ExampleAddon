import './styles.css'

import { useState } from 'react'

import { defineAddon, type PulseSyncAddonComponentProps } from '@pulsesync/addon-sdk'

import addonConfig from '../addon.config.mjs'
import { settings } from './settings'

function ExampleAddon({ api }: PulseSyncAddonComponentProps) {
    const [clicks, setClicks] = useState(0)
    const { accentColor, enabled } = settings.use()

    if (!enabled) return null

    return (
        <>
            <button
                className="ps-example-addon"
                style={{ backgroundColor: accentColor }}
                onClick={() => {
                    void api.client.togglePlayPause()
                    setClicks(value => value + 1)
                }}
            >
                {addonConfig.name}: {clicks}
            </button>
        </>
    )
}

export default defineAddon({
    id: addonConfig.id,
    name: addonConfig.name,
    settings,
    slots: {
        playerBarButton: ExampleAddon,
    },
})
