import { defineSettings } from '@pulsesync/addon-sdk'

export const settings = defineSettings(
    {
        enabled: {
            type: 'boolean',
            name: 'Включить кнопку',
            description: 'Показывает компонент аддона в интерфейсе.',
            default: true,
        },
        accentColor: {
            type: 'color',
            name: 'Цвет кнопки',
            default: '#4ade80',
        },
    },
    { title: 'Основные' },
)
