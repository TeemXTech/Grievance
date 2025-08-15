const { spawn } = require('child_process')

console.log('🚀 Starting development server...')

const server = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true,
  cwd: process.cwd()
})

server.on('error', (error) => {
  console.error('❌ Server error:', error)
})

server.on('close', (code) => {
  console.log(`🛑 Server exited with code ${code}`)
})

// Keep the process running
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping server...')
  server.kill('SIGINT')
  process.exit(0)
})