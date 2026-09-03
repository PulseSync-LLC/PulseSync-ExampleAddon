import './styles.css'

import { defineAddon, type AddonComponentProps, YandexMusicIcon } from '@pulsesync/addon-sdk'

import addonConfig from '../addon.config.mjs'
import { settings } from './settings'

function PlayerBarButton({ api }: AddonComponentProps) {
    const { enabled } = settings.use()

    if (!enabled) return null

    const showNotification = () => api.notifications.show('Аддон работает', {})

    return (
        <button
            type="button"
            className="ps-example-addon"
            aria-label="Показать уведомление"
            title="Показать уведомление"
            data-pulsesync-tooltip-description="Тестовое уведомление через PulseSync API"
            onClick={() => void showNotification().catch((error: unknown) => api.logger.error('Не удалось показать уведомление', error))}
        >
            <YandexMusicIcon name="info" size="xxs" />
        </button>
    )
}

export default defineAddon({
    id: addonConfig.id,
    name: addonConfig.name,
    settings,
    slots: {
        playerBarButton: PlayerBarButton,
    },
    trackMenuItems: [
        {
            id: 'check-webhost',
            label: 'Проверить WebHost',
            icon: 'info',
            position: 1,
            onClick: ({ api, track }) => {
                const album = track.albumId ? `, album ${track.albumId}` : ''
                return api.notifications.show(`Track ${track.id}${album}`)
            },
        },
    ],
})
