import path from 'node:path'
import { spawn } from 'node:child_process'
import { promises as fs } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'

import { deliverAddon, formatDeliveryResult, localModuleSignature, notifyClient } from './addon-delivery.mjs'
import { createModuleBuilder } from './module-build.mjs'

const scriptRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const rootDir = process.argv[2] ? path.resolve(process.argv[2]) : scriptRoot
const addonConfigPath = path.join(rootDir, 'addon.config.mjs')
const { default: addonConfig } = await import(pathToFileURL(addonConfigPath).href)
const viteBin = path.join(rootDir, 'node_modules', 'vite', 'bin', 'vite.js')
const outDir = path.join(rootDir, '.pulsesync-dev', addonConfig.directoryName)
const addonStaticDir = path.join(rootDir, 'addon')

async function loadAddonConfig() {
    const configUrl = new URL(pathToFileURL(addonConfigPath).href)
    configUrl.searchParams.set('ts', String(Date.now()))
    const module = await import(configUrl.href)

    return module.default
}

async function collectWatchEntries(dir, bucket = []) {
    const entries = await fs.readdir(dir, { withFileTypes: true })

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name)
        const stat = await fs.stat(fullPath)

        if (entry.isDirectory()) {
            await collectWatchEntries(fullPath, bucket)
            continue
        }

        bucket.push(`${path.relative(rootDir, fullPath)}:${stat.mtimeMs}:${stat.size}`)
    }

    return bucket
}

async function hasStaticAddonDir() {
    try {
        return (await fs.stat(addonStaticDir)).isDirectory()
    } catch (error) {
        if (error?.code === 'ENOENT') return false
        throw error
    }
}

async function buildStaticSignature() {
    const entries = (await hasStaticAddonDir()) ? await collectWatchEntries(addonStaticDir) : []
    const addonConfigStat = await fs.stat(addonConfigPath)

    entries.push(`${path.relative(rootDir, addonConfigPath)}:${addonConfigStat.mtimeMs}:${addonConfigStat.size}`)

    return entries.sort().join('|')
}

async function syncStaticAddonArtifacts() {
    const currentAddonConfig = await loadAddonConfig()
    const nextDirectoryName = String(currentAddonConfig?.directoryName || '').trim()

    if (nextDirectoryName && nextDirectoryName !== path.basename(outDir) && warnedDirectoryName !== nextDirectoryName) {
        warnedDirectoryName = nextDirectoryName
        console.warn(`addon.config.mjs directoryName changed to "${nextDirectoryName}". Restart yarn dev to switch the output folder.`)
    }

    await fs.mkdir(outDir, { recursive: true })
    if (await hasStaticAddonDir()) {
        await fs.cp(addonStaticDir, outDir, { recursive: true, force: true })
    }
}

async function collectBuildEntries() {
    try {
        return await collectWatchEntries(outDir)
    } catch (error) {
        if (error?.code === 'ENOENT') return []
        throw error
    }
}

async function buildIsReady() {
    try {
        const metadata = JSON.parse(await fs.readFile(path.join(outDir, 'metadata.json'), 'utf8'))
        return typeof metadata.script === 'string' && metadata.script.trim() && (await fs.stat(path.join(outDir, metadata.script))).isFile()
    } catch {
        return false
    }
}

console.log('Разработка аддона: сборка, синхронизация и перезагрузка выполняются автоматически. Ctrl+C — выход.')

let lastStaticSignature = ''
let warnedDirectoryName = ''
let observedBuildSignature = ''
let lastDeliveredBuildSignature = ''
let buildStableSince = 0
let delivering = false
let syncingStatic = false
let lastDelivery
let lastClientCheck = 0
let lastClientMessage = ''
let lastDeliveryError = ''
let stopping = false
let child
let deliveryTimer
let staticSyncTimer
let moduleTimer
const modules = createModuleBuilder(rootDir)

const stop = signal => {
    stopping = true
    clearInterval(staticSyncTimer)
    clearInterval(deliveryTimer)
    clearInterval(moduleTimer)
    modules.stop()
    child?.kill(signal)
}
process.on('SIGINT', () => stop('SIGINT'))
process.on('SIGTERM', () => stop('SIGTERM'))

function reportClient(result) {
    const message = formatDeliveryResult(result)
    if (message !== lastClientMessage) console.log(message)
    lastClientMessage = message
}

const syncStaticIfNeeded = async force => {
    const nextSignature = await buildStaticSignature()
    if (!force && nextSignature === lastStaticSignature) {
        return
    }

    lastStaticSignature = nextSignature
    await syncStaticAddonArtifacts()
    console.log('Synced static addon files')
}

await syncStaticIfNeeded(true)
await modules.update({ force: true })
if (stopping) process.exit(130)

child = spawn(process.execPath, [viteBin, 'build', '--watch', '--mode', 'development'], {
    cwd: rootDir,
    env: {
        ...process.env,
        PULSESYNC_ADDON_OUT_DIR: outDir,
    },
    stdio: 'inherit',
    windowsHide: true,
})

moduleTimer = setInterval(() => {
    if (!delivering && !syncingStatic) void modules.update()
}, 500)

deliveryTimer = setInterval(async () => {
    if (delivering || stopping || !modules.ready) return
    delivering = true
    try {
        const entries = await collectBuildEntries()
        const signature = entries.sort().join('|') + (await localModuleSignature(rootDir))
        if (!signature) return

        if (signature !== observedBuildSignature) {
            observedBuildSignature = signature
            buildStableSince = Date.now()
            return
        }
        if (signature === lastDeliveredBuildSignature) {
            if (lastDelivery && Date.now() - lastClientCheck >= 5000) {
                lastClientCheck = Date.now()
                const client = await notifyClient(lastDelivery.directoryName)
                reportClient({ ...lastDelivery, client })
            }
            return
        }
        if (Date.now() - buildStableSince < 600) return
        if (!(await buildIsReady())) return
        if (!modules.ready || stopping) return

        const result = await deliverAddon(outDir, await loadAddonConfig(), rootDir)
        lastDeliveredBuildSignature = signature
        lastDelivery = result
        lastClientCheck = Date.now()
        lastClientMessage = ''
        lastDeliveryError = ''
        reportClient(result)
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        if (message !== lastDeliveryError) console.error(`Не удалось синхронизировать аддон: ${message}`)
        lastDeliveryError = message
    } finally {
        delivering = false
    }
}, 200)

staticSyncTimer = setInterval(async () => {
    if (syncingStatic || delivering || stopping) return
    syncingStatic = true
    try {
        await syncStaticIfNeeded(false)
    } catch (error) {
        console.error('Failed to sync static addon files:', error)
    } finally {
        syncingStatic = false
    }
}, 500)

child.on('error', error => {
    console.error(`Не удалось запустить Vite: ${error.message}`)
    stop('SIGTERM')
    process.exitCode = 1
})

child.on('exit', code => {
    stop('SIGTERM')
    process.exitCode = code ?? 0
})
