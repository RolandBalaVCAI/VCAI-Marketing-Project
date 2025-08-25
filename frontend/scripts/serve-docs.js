import { spawn } from 'child_process'
import fs from 'fs'

function serveDocs() {
  console.log('🚀 Starting documentation development server...')
  
  // Check if OpenAPI schema exists
  if (!fs.existsSync('openapi.json')) {
    console.log('📝 Generating OpenAPI schema first...')
    const generateProcess = spawn('npm', ['run', 'docs:generate'], { 
      stdio: 'inherit',
      shell: true 
    })
    
    generateProcess.on('close', (code) => {
      if (code === 0) {
        startRedocServer()
      } else {
        console.error('❌ Failed to generate OpenAPI schema')
        process.exit(1)
      }
    })
  } else {
    startRedocServer()
  }
}

function startRedocServer() {
  // Read configuration
  const configPath = 'redoc.config.json'
  let configOptions = ''
  
  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'))
    configOptions = `--options '${JSON.stringify(config)}'`
  }
  
  // Start Redoc server
  const serverProcess = spawn('redoc-cli', [
    'serve',
    'openapi.json',
    '--watch',
    '--port=8080',
    ...configOptions.split(' ').filter(Boolean)
  ], {
    stdio: 'inherit',
    shell: true
  })
  
  console.log('📚 Documentation server started at http://localhost:8080')
  console.log('🔄 Watching for changes...')
  
  // Handle process termination
  process.on('SIGINT', () => {
    console.log('\n👋 Shutting down documentation server...')
    serverProcess.kill('SIGINT')
    process.exit(0)
  })
  
  serverProcess.on('close', (code) => {
    if (code !== 0) {
      console.error(`❌ Documentation server exited with code ${code}`)
    }
    process.exit(code)
  })
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  serveDocs()
}