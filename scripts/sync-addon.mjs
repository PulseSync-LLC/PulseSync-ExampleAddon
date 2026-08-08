import path from 'node:path'
import { fileURLToPath } from 'node:url'

import addonConfig from '../addon.config.mjs'
import { deliverAddon, formatDeliveryResult } from './addon-delivery.mjs'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const sourceDir = path.join(rootDir, 'dist', addonConfig.directoryName)

async function main() {
    const result = await deliverAddon(sourceDir)
    console.log(formatDeliveryResult(result))
    console.log(`Addon directory: ${result.targetDir}`)
}

main().catch(error => {
    console.error('Failed to sync addon:', error)
    process.exitCode = 1
})
