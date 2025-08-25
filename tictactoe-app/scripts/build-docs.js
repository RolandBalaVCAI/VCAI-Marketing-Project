import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'

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
    
    execSync(`redoc-cli build ${config.openApiFile} --output ${path.join(config.outputDir, config.outputFile)} --title "Marketing Dashboard API Documentation"`, { 
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
}

// Run the build process
buildDocs()