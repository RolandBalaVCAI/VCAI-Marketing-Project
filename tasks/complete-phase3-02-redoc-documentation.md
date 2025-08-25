# Phase 3 Task 2: Add NPM Script for Redoc Documentation

## Objective
Set up Redoc to generate beautiful, interactive API documentation from the OpenAPI schema, with NPM scripts for development and production builds.

## Current State
- OpenAPI schema generated from mock API
- No interactive documentation interface
- Developers must read raw JSON schema
- No user-friendly way to explore API

## Target State
- Interactive Redoc documentation website
- NPM scripts for building and serving docs
- Development server with hot reload
- Production-ready static documentation
- Customized branding and styling

## Implementation Steps

### 1. Install Redoc Dependencies
Add necessary packages for Redoc generation:
- redoc-cli for command-line generation
- redoc for React component integration
- http-server for serving static files

### 2. Create Redoc Configuration
Set up custom configuration:
- Branding and theme customization
- Navigation and layout options
- Code sample languages
- Additional features and plugins

### 3. Build Documentation Scripts
Create NPM scripts for:
- Development server with watch mode
- Production build generation
- Static file serving
- Documentation deployment

### 4. Custom Styling and Branding
Customize documentation appearance:
- Company branding and colors
- Custom CSS styling
- Logo and favicon integration
- Responsive design tweaks

## Detailed Implementation

### Install Dependencies
```bash
npm install --save-dev redoc-cli redoc http-server
```

### Package.json Scripts
```json
{
  "scripts": {
    "docs:generate": "node scripts/generate-openapi.js",
    "docs:validate": "node scripts/validate-openapi.js",
    "docs:build": "redoc-cli build openapi.json --output docs/index.html --options.theme.colors.primary.main=#2563eb",
    "docs:serve": "redoc-cli serve openapi.json --options.theme.colors.primary.main=#2563eb --watch",
    "docs:serve-static": "http-server docs -p 8080 -o",
    "docs:dev": "npm-run-all --parallel docs:watch docs:serve",
    "docs:watch": "nodemon --watch src/api --ext js --exec \"npm run docs:generate\"",
    "docs:deploy-build": "npm run docs:generate && npm run docs:validate && npm run docs:build"
  },
  "devDependencies": {
    "npm-run-all": "^4.1.5"
  }
}
```

### Redoc Configuration (`redoc.config.json`)
```json
{
  "theme": {
    "colors": {
      "primary": {
        "main": "#2563eb"
      },
      "success": {
        "main": "#059669"
      },
      "warning": {
        "main": "#f59e0b"
      },
      "error": {
        "main": "#dc2626"
      }
    },
    "typography": {
      "fontSize": "14px",
      "lineHeight": "1.5em",
      "code": {
        "fontSize": "13px",
        "fontFamily": "Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace"
      },
      "headings": {
        "fontFamily": "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        "fontWeight": "600"
      }
    },
    "sidebar": {
      "backgroundColor": "#fafafa",
      "width": "300px"
    },
    "rightPanel": {
      "backgroundColor": "#263238",
      "width": "40%"
    }
  },
  "scrollYOffset": 60,
  "hideDownloadButton": false,
  "disableSearch": false,
  "hideLoading": false,
  "nativeScrollbars": false,
  "requiredPropsFirst": true,
  "sortPropsAlphabetically": true,
  "showExtensions": true,
  "hideSchemaPattern": false,
  "expandResponses": "200,201",
  "expandSingleSchemaField": true,
  "schemaExpansionLevel": 2,
  "payloadSampleIdx": 0,
  "menuToggle": true,
  "hideRequestPayloadSample": false,
  "sideNavStyle": "summary-only"
}
```

### Enhanced Documentation Build Script (`scripts/build-docs.js`)
```javascript
const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

// Configuration
const config = {
  openApiFile: 'openapi.json',
  outputDir: 'docs',
  outputFile: 'index.html',
  templateDir: 'docs-template',
  assetsDir: 'docs-assets'
}

async function buildDocs() {
  console.log('🏗️ Building API documentation...')
  
  try {
    // Ensure output directory exists
    if (!fs.existsSync(config.outputDir)) {
      fs.mkdirSync(config.outputDir, { recursive: true })
    }
    
    // Generate OpenAPI schema first
    console.log('📝 Generating OpenAPI schema...')
    execSync('npm run docs:generate', { stdio: 'inherit' })
    
    // Validate schema
    console.log('✅ Validating schema...')
    execSync('npm run docs:validate', { stdio: 'inherit' })
    
    // Read configuration
    const redocConfig = fs.existsSync('redoc.config.json') 
      ? JSON.parse(fs.readFileSync('redoc.config.json', 'utf8'))
      : {}
    
    // Build Redoc documentation
    console.log('📚 Building Redoc documentation...')
    
    const redocOptions = [
      `--output ${path.join(config.outputDir, config.outputFile)}`,
      `--title "Marketing Dashboard API Documentation"`,
      `--options '${JSON.stringify(redocConfig)}'`
    ].join(' ')
    
    execSync(`redoc-cli build ${config.openApiFile} ${redocOptions}`, { 
      stdio: 'inherit' 
    })
    
    // Copy custom assets if they exist
    if (fs.existsSync(config.assetsDir)) {
      console.log('📁 Copying custom assets...')
      copyRecursiveSync(config.assetsDir, path.join(config.outputDir, 'assets'))
    }
    
    // Customize HTML if template exists
    if (fs.existsSync(config.templateDir)) {
      console.log('🎨 Applying custom template...')
      await customizeHtml()
    }
    
    // Generate additional files
    await generateAdditionalFiles()
    
    console.log('✅ Documentation built successfully!')
    console.log(`📂 Output: ${path.resolve(config.outputDir)}`)
    console.log(`🌐 Serve with: npm run docs:serve-static`)
    
  } catch (error) {
    console.error('❌ Documentation build failed:', error.message)
    process.exit(1)
  }
}

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src)
  const stats = exists && fs.statSync(src)
  const isDirectory = exists && stats.isDirectory()
  
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true })
    }
    fs.readdirSync(src).forEach(childItemName => {
      copyRecursiveSync(
        path.join(src, childItemName),
        path.join(dest, childItemName)
      )
    })
  } else {
    fs.copyFileSync(src, dest)
  }
}

async function customizeHtml() {
  const htmlPath = path.join(config.outputDir, config.outputFile)
  let html = fs.readFileSync(htmlPath, 'utf8')
  
  // Add custom CSS
  const customCssPath = path.join(config.templateDir, 'custom.css')
  if (fs.existsSync(customCssPath)) {
    const customCss = fs.readFileSync(customCssPath, 'utf8')
    html = html.replace('</head>', `<style>${customCss}</style></head>`)
  }
  
  // Add custom JavaScript
  const customJsPath = path.join(config.templateDir, 'custom.js')
  if (fs.existsSync(customJsPath)) {
    const customJs = fs.readFileSync(customJsPath, 'utf8')
    html = html.replace('</body>', `<script>${customJs}</script></body>`)
  }
  
  // Add favicon
  const faviconPath = path.join(config.templateDir, 'favicon.ico')
  if (fs.existsSync(faviconPath)) {
    fs.copyFileSync(faviconPath, path.join(config.outputDir, 'favicon.ico'))
    html = html.replace('</head>', '<link rel="icon" type="image/x-icon" href="favicon.ico"></head>')
  }
  
  // Add analytics or other tracking (example)
  html = html.replace('</head>', `
    <!-- Custom meta tags -->
    <meta name="description" content="Marketing Dashboard API Documentation - Comprehensive guide for developers">
    <meta name="keywords" content="API, Marketing, Dashboard, REST, Documentation">
    <meta name="author" content="Marketing Dashboard Team">
    
    <!-- Open Graph meta tags -->
    <meta property="og:title" content="Marketing Dashboard API Documentation">
    <meta property="og:description" content="Comprehensive API documentation for the Marketing Dashboard platform">
    <meta property="og:type" content="website">
    
    <!-- Twitter Card meta tags -->
    <meta name="twitter:card" content="summary">
    <meta name="twitter:title" content="Marketing Dashboard API Documentation">
    <meta name="twitter:description" content="Comprehensive API documentation for developers">
  </head>`)
  
  fs.writeFileSync(htmlPath, html)
}

async function generateAdditionalFiles() {
  // Generate README for docs directory
  const readmeContent = `# Marketing Dashboard API Documentation

This directory contains the generated API documentation for the Marketing Dashboard.

## Files

- \`index.html\` - Main documentation page (open this in a browser)
- \`openapi.json\` - OpenAPI 3.0 specification
- \`assets/\` - Custom assets and styling

## Viewing the Documentation

### Option 1: Open in Browser
Simply open \`index.html\` in your web browser.

### Option 2: Serve with HTTP Server
\`\`\`bash
npm run docs:serve-static
\`\`\`

### Option 3: Development Server
\`\`\`bash
npm run docs:serve
\`\`\`

## Development

To rebuild the documentation after making changes:

\`\`\`bash
npm run docs:deploy-build
\`\`\`

## API Overview

The Marketing Dashboard API provides comprehensive endpoints for:

- **Campaign Management** - CRUD operations for marketing campaigns
- **Analytics & Reporting** - Performance metrics and insights
- **Media Management** - Document and visual media handling
- **System Operations** - Health checks and system information

## Getting Started

1. Review the API endpoints in the documentation
2. Check out the schema definitions for request/response formats
3. Try the examples provided in each endpoint
4. Use the generated SDK (see SDK documentation)

## Support

For API support or questions, contact the development team.
`
  
  fs.writeFileSync(path.join(config.outputDir, 'README.md'), readmeContent)
  
  // Copy OpenAPI schema to docs directory
  if (fs.existsSync(config.openApiFile)) {
    fs.copyFileSync(
      config.openApiFile, 
      path.join(config.outputDir, 'openapi.json')
    )
  }
  
  // Generate a simple landing page redirect
  const indexRedirect = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Marketing Dashboard API</title>
    <meta http-equiv="refresh" content="0; url=./index.html">
    <link rel="canonical" href="./index.html">
</head>
<body>
    <p>If you are not redirected automatically, <a href="./index.html">visit the API documentation</a>.</p>
</body>
</html>`
  
  // Don't overwrite if index.html already exists
  const indexPath = path.join(config.outputDir, 'api.html')
  if (!fs.existsSync(indexPath)) {
    fs.writeFileSync(indexPath, indexRedirect)
  }
}

// Run if called directly
if (require.main === module) {
  buildDocs()
}

module.exports = { buildDocs }
```

### Custom Styling (`docs-template/custom.css`)
```css
/* Custom styling for Redoc documentation */

/* Brand colors and theme customization */
:root {
  --primary-color: #2563eb;
  --success-color: #059669;
  --warning-color: #f59e0b;
  --error-color: #dc2626;
  --background-color: #fafafa;
  --text-color: #1a1a1a;
  --border-color: #e0e0e0;
}

/* Custom header styling */
.redoc-wrap > div[role="navigation"] {
  border-bottom: 2px solid var(--primary-color);
}

/* Improve code block styling */
.redoc-json code {
  font-family: 'Monaco', 'Consolas', 'Andale Mono', 'Ubuntu Mono', monospace;
  font-size: 13px;
  line-height: 1.4;
}

/* Custom button styling */
button {
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.2s ease;
}

/* Improve table styling */
table {
  border-collapse: collapse;
  border-spacing: 0;
}

table th,
table td {
  border: 1px solid var(--border-color);
  padding: 12px;
  text-align: left;
}

table th {
  background-color: var(--background-color);
  font-weight: 600;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Responsive improvements */
@media screen and (max-width: 768px) {
  .redoc-wrap {
    font-size: 14px;
  }
  
  .api-content {
    padding: 16px;
  }
}

/* Print styles */
@media print {
  .redoc-wrap {
    font-size: 12px;
  }
  
  button,
  .menu-content {
    display: none !important;
  }
  
  .api-content {
    width: 100% !important;
    margin: 0 !important;
  }
}

/* Custom loading animation */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.loading {
  animation: pulse 2s ease-in-out infinite;
}

/* Improve syntax highlighting */
.token.keyword {
  color: #0066cc;
  font-weight: 600;
}

.token.string {
  color: #009900;
}

.token.number {
  color: #cc6600;
}

.token.boolean {
  color: #990099;
}

/* Custom status code colors */
.http-verb.get { background-color: var(--success-color); }
.http-verb.post { background-color: var(--primary-color); }
.http-verb.put { background-color: var(--warning-color); }
.http-verb.delete { background-color: var(--error-color); }
.http-verb.patch { background-color: #6f42c1; }

/* Improve navigation */
.menu-content {
  padding-top: 20px;
}

.menu-content li > label {
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 8px;
}

/* Add custom branding */
.redoc-wrap::before {
  content: "Marketing Dashboard API";
  display: block;
  font-size: 24px;
  font-weight: 700;
  color: var(--primary-color);
  padding: 20px;
  text-align: center;
  border-bottom: 1px solid var(--border-color);
  background-color: white;
}
```

### Development Server Script (`scripts/serve-docs.js`)
```javascript
const { spawn } = require('child_process')
const fs = require('fs')
const path = require('path')

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
if (require.main === module) {
  serveDocs()
}

module.exports = { serveDocs }
```

## Testing Criteria
- [ ] Redoc documentation builds successfully
- [ ] Documentation renders correctly in browser
- [ ] All API endpoints are displayed with proper formatting
- [ ] Examples and schemas are shown correctly
- [ ] Custom styling and branding are applied
- [ ] Development server works with hot reload
- [ ] Static documentation can be served independently
- [ ] Documentation is responsive on mobile devices

## Definition of Done
- Interactive Redoc documentation generated from OpenAPI schema
- Custom styling and branding applied
- NPM scripts for development and production builds
- Development server with hot reload functionality
- Production-ready static documentation output
- Documentation accessible via web browser
- Custom assets and templates integrated
- README and supporting files generated

## Files to Create
- `scripts/build-docs.js`
- `scripts/serve-docs.js`
- `redoc.config.json`
- `docs-template/custom.css`
- `docs-template/custom.js` (optional)
- `docs-template/favicon.ico` (optional)
- Update `package.json` with Redoc scripts

## Dependencies
- Completed Phase 3 Task 1 (OpenAPI Generator)
- Generated OpenAPI schema

## Estimated Time
3-4 hours