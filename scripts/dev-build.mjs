import path from 'node:path'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'

import { getPulseSyncAddonDir } from './pulsesync-paths.mjs'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const viteBin = path.join(rootDir, 'node_modules', 'vite', 'bin', 'vite.js')
const outDir = getPulseSyncAddonDir()

console.log(`Watching addon build into ${outDir}`)

const child = spawn(process.execPath, [viteBin, 'build', '--watch', '--mode', 'development'], {
    cwd: rootDir,
    env: {
        ...process.env,
        PULSESYNC_ADDON_OUT_DIR: outDir,
    },
    stdio: 'inherit',
})

child.on('exit', code => {
    process.exitCode = code ?? 0
})
