import path from 'node:path'
import { spawn } from 'node:child_process'
import { promises as fs } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'

import addonConfig from '../addon.config.mjs'
import { deliverAddon, formatDeliveryResult } from './addon-delivery.mjs'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const viteBin = path.join(rootDir, 'node_modules', 'vite', 'bin', 'vite.js')
const outDir = path.join(rootDir, '.pulsesync-dev', addonConfig.directoryName)
const addonStaticDir = path.join(rootDir, 'addon')
const addonConfigPath = path.join(rootDir, 'addon.config.mjs')

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

async function buildStaticSignature() {
    const entries = await collectWatchEntries(addonStaticDir)
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
    await fs.cp(addonStaticDir, outDir, { recursive: true, force: true })
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

console.log(`Watching addon sources; staging completed builds in ${outDir}`)

let lastStaticSignature = ''
let staticSyncPromise = Promise.resolve()
let warnedDirectoryName = ''
let observedBuildSignature = ''
let lastDeliveredBuildSignature = ''
let buildStableSince = 0
let deliveryPromise = Promise.resolve()

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

const child = spawn(process.execPath, [viteBin, 'build', '--watch', '--mode', 'development'], {
    cwd: rootDir,
    env: {
        ...process.env,
        PULSESYNC_ADDON_OUT_DIR: outDir,
    },
    stdio: 'inherit',
})

const deliveryTimer = setInterval(() => {
    deliveryPromise = deliveryPromise
        .then(async () => {
            const entries = await collectBuildEntries()
            const signature = entries.sort().join('|')
            if (!signature) return

            if (signature !== observedBuildSignature) {
                observedBuildSignature = signature
                buildStableSince = Date.now()
                return
            }
            if (signature === lastDeliveredBuildSignature || Date.now() - buildStableSince < 600) return
            if (!(await buildIsReady())) return

            const result = await deliverAddon(outDir)
            lastDeliveredBuildSignature = signature
            console.log(formatDeliveryResult(result))
        })
        .catch(error => {
            console.error('Failed to deliver addon build:', error)
        })
}, 200)

const staticSyncTimer = setInterval(() => {
    staticSyncPromise = staticSyncPromise
        .then(() => syncStaticIfNeeded(false))
        .catch(error => {
            console.error('Failed to sync static addon files:', error)
        })
}, 500)

const stop = signal => {
    clearInterval(staticSyncTimer)
    clearInterval(deliveryTimer)
    child.kill(signal)
}

process.on('SIGINT', () => stop('SIGINT'))
process.on('SIGTERM', () => stop('SIGTERM'))

child.on('exit', code => {
    clearInterval(staticSyncTimer)
    clearInterval(deliveryTimer)
    process.exitCode = code ?? 0
})
