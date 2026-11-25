import { readFile, writeFile, readdir, mkdir } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
import { spawn } from 'node:child_process'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const require = createRequire(import.meta.url)
const nuxtRequire = createRequire(require.resolve('nuxt/package.json'))
const viteRequire = createRequire(nuxtRequire.resolve('vite/package.json'))
const { build } = viteRequire('esbuild')
const assets = resolve(root, '.output/public/_nuxt')
const destination = resolve(process.argv[2] || resolve(root, 'exports/zonhack-demo.html'))
const port = 3107
const server = spawn(process.execPath, [resolve(root, '.output/server/index.mjs')], {
  cwd: root,
  env: { ...process.env, NUXT_DEMO_MODE: 'true', HOST: '127.0.0.1', PORT: String(port) },
  stdio: 'ignore',
})

try {
  let html
  for (let attempt = 0; attempt < 50; attempt++) {
    if (server.exitCode !== null) throw new Error('The export server could not start. Build the app and leave port 3107 free.')
    try { const response = await fetch(`http://127.0.0.1:${port}/`); if (response.ok) { html = await response.text(); break } } catch { /* wait for Nitro startup */ }
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  if (!html) throw new Error('The built app did not become ready. Run pnpm build first.')
  const entryName = html.match(/<script[^>]*type="module"[^>]*src="\/_nuxt\/([^"]+)"/)?.[1]
  if (!entryName) throw new Error('Could not identify the built Nuxt entry')
  const entry = resolve(assets, entryName)
  const result = await build({
    stdin: { contents: `import ${JSON.stringify(resolve(root, 'scripts/offline-adapter.ts'))}; import ${JSON.stringify(entry)};`, resolveDir: root },
    bundle: true, format: 'iife', platform: 'browser', target: 'es2022', minify: true, write: false,
    define: { 'import.meta.url': JSON.stringify('file:///zonhack-demo.html') },
    plugins: [{ name: 'self-contained-nuxt', setup(builder) {
      builder.onResolve({ filter: /^#entry$/ }, () => ({ path: entry }))
      builder.onLoad({ filter: /\.js$/ }, async args => {
        if (!args.path.startsWith(assets)) return undefined
        let contents = await readFile(args.path, 'utf8')
        // Dynamic chunks are bundled below; their Vite preloads must not request files.
        contents = contents.replace(/const __vite__mapDeps=[^\n]*\n/g, 'const __vite__mapDeps=()=>[];\n')
        return { contents, loader: 'js' }
      })
    } }],
    logLevel: 'silent',
  })
  const files = await readdir(assets)
  const css = (await Promise.all(files.filter(f => f.endsWith('.css')).map(f => readFile(resolve(assets, f), 'utf8')))).join('\n')
  html = html.replace(/<script type="importmap">[\s\S]*?<\/script>/g, '')
    .replace(/<script[^>]*type="module"[^>]*src="[^"]+"[^>]*><\/script>/g, '')
    .replace(/<link\b[^>]*>/g, '')
    .replace('baseURL:"/"', 'baseURL:"#"')
    .replace('</head>', () => `<style>${css.replaceAll('</style', '<\\/style')}</style></head>`)
  const js = result.outputFiles.find(f => f.path.endsWith('.js'))?.text || result.outputFiles[0].text
  html = html.replace('</body>', () => `<script>${js.replaceAll('</script', '<\\/script')}</script></body>`)
  await mkdir(dirname(destination), { recursive: true })
  await writeFile(destination, html)
  console.log(`Standalone HTML: ${destination}\n${Buffer.byteLength(html).toLocaleString()} bytes. Styles, scripts, charts and dummy-data adapter included.`)
} finally { server.kill() }
