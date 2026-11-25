const url = process.env.BENCHMARK_URL || 'http://127.0.0.1:3000'
const end = new Date().toISOString().slice(0, 10)
const start = new Date(Date.now() - 29 * 86400000).toISOString().slice(0, 10)
const times = []
let bytes = 0
for (let i = 0; i < 21; i++) {
  const t = performance.now()
  const response = await fetch(`${url}/api/analytics`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ start, end }) })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const body = await response.text()
  if (JSON.parse(body).mode !== 'demo') throw new Error('Benchmark requires synthetic demo mode')
  if (i > 0) times.push(performance.now() - t)
  bytes = Buffer.byteLength(body)
}
times.sort((a, b) => a - b)
console.log(JSON.stringify({ requests: times.length, medianMs: times[Math.floor(times.length / 2)], p95Ms: times[Math.ceil(times.length * .95) - 1], responseBytes: bytes, scope: 'Warm serial loopback HTTP, synthetic fixtures only. No database or concurrent workload.' }, null, 2))
