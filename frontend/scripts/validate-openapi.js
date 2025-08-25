import SwaggerParser from '@apidevtools/swagger-parser'
import fs from 'fs'
import path from 'path'

async function validateSchema() {
  const schemaPath = path.join(process.cwd(), 'openapi.json')
  
  if (!fs.existsSync(schemaPath)) {
    console.error('❌ OpenAPI schema file not found. Run npm run docs:generate first.')
    process.exit(1)
  }
  
  try {
    console.log('🔍 Validating OpenAPI schema...')
    
    const api = await SwaggerParser.validate(schemaPath)
    
    console.log('✅ OpenAPI schema is valid!')
    console.log(`📋 API Title: ${api.info.title}`)
    console.log(`🔢 Version: ${api.info.version}`)
    console.log(`🌐 Servers: ${api.servers?.length || 0}`)
    console.log(`📍 Endpoints: ${Object.keys(api.paths).length}`)
    console.log(`📦 Schemas: ${Object.keys(api.components?.schemas || {}).length}`)
    
    // Additional validation checks
    const warnings = []
    
    // Check for missing examples
    for (const [path, methods] of Object.entries(api.paths)) {
      for (const [method, operation] of Object.entries(methods)) {
        if (typeof operation === 'object' && operation.responses) {
          for (const [status, response] of Object.entries(operation.responses)) {
            if (response.content && !response.content['application/json']?.example) {
              warnings.push(`Missing example for ${method.toUpperCase()} ${path} ${status} response`)
            }
          }
        }
      }
    }
    
    if (warnings.length > 0) {
      console.log('\n⚠️ Warnings:')
      warnings.forEach(warning => console.log(`   - ${warning}`))
    }
    
  } catch (error) {
    console.error('❌ OpenAPI schema validation failed:')
    console.error(error.message)
    
    if (error.details) {
      console.error('\n📋 Validation details:')
      error.details.forEach(detail => {
        console.error(`   - ${detail.message} (${detail.path})`)
      })
    }
    
    process.exit(1)
  }
}

validateSchema()