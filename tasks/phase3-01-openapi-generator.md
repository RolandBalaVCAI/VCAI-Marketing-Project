# Phase 3 Task 1: Create OpenAPI Schema Generator

## Objective
Create an automatic OpenAPI schema generator that introspects the mock API service to produce comprehensive API documentation in OpenAPI 3.0 format.

## Current State
- Mock API service with various endpoints
- No formal API documentation
- Manual API usage requires code inspection
- No standardized API contracts

## Target State
- Automatic OpenAPI schema generation from mock API
- Comprehensive API documentation with examples
- Standardized API contracts for development
- Foundation for SDK generation and interactive docs

## Implementation Steps

### 1. Install Documentation Dependencies
Add necessary packages for OpenAPI generation:
- swagger-jsdoc for JSDoc-based schema generation
- swagger-parser for schema validation
- openapi-types for TypeScript definitions

### 2. Create Schema Generator
Build introspection system:
- Analyze mock API endpoints and methods
- Extract request/response schemas
- Generate OpenAPI compliant documentation
- Include examples and validation rules

### 3. Document API Endpoints
Add comprehensive JSDoc comments:
- Endpoint descriptions and parameters
- Request/response body schemas
- Error response formats
- Authentication requirements

### 4. Create Generator Script
Build automated generation script:
- NPM script for generating schemas
- Watch mode for development
- Output formatting and validation

## Detailed Implementation

### Install Dependencies
```bash
npm install --save-dev swagger-jsdoc swagger-parser @apidevtools/swagger-parser openapi-types
```

### Package.json Scripts
```json
{
  "scripts": {
    "docs:generate": "node scripts/generate-openapi.js",
    "docs:validate": "node scripts/validate-openapi.js",
    "docs:watch": "nodemon --watch src/api --exec \"npm run docs:generate\"",
    "docs:serve": "npx swagger-ui-serve openapi.json"
  }
}
```

### OpenAPI Generator Script (`scripts/generate-openapi.js`)
```javascript
const fs = require('fs')
const path = require('path')
const swaggerJSDoc = require('swagger-jsdoc')

// OpenAPI specification definition
const swaggerDefinition = {
  openapi: '3.0.3',
  info: {
    title: 'Marketing Dashboard API',
    version: '1.0.0',
    description: 'Comprehensive API for managing marketing campaigns, analytics, and reporting',
    contact: {
      name: 'API Support',
      email: 'api-support@example.com'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    }
  },
  servers: [
    {
      url: 'http://localhost:5173/api',
      description: 'Development server'
    },
    {
      url: 'https://api.marketing-dashboard.example.com',
      description: 'Production server'
    }
  ],
  tags: [
    {
      name: 'Campaigns',
      description: 'Campaign management operations'
    },
    {
      name: 'Analytics',
      description: 'Analytics and reporting endpoints'
    },
    {
      name: 'Media',
      description: 'Visual media and document management'
    },
    {
      name: 'System',
      description: 'System and health check endpoints'
    }
  ],
  components: {
    schemas: {
      Campaign: {
        type: 'object',
        required: ['id', 'name', 'vendor', 'status', 'startDate', 'endDate', 'metrics'],
        properties: {
          id: {
            type: 'string',
            description: 'Unique campaign identifier',
            example: 'CMP-2024-001'
          },
          name: {
            type: 'string',
            description: 'Campaign name',
            minLength: 1,
            maxLength: 255,
            example: 'Summer Sale Campaign'
          },
          vendor: {
            type: 'string',
            description: 'Marketing vendor name',
            example: 'AdTech Solutions'
          },
          status: {
            type: 'string',
            enum: ['Live', 'Paused', 'Ended'],
            description: 'Current campaign status',
            example: 'Live'
          },
          startDate: {
            type: 'string',
            format: 'date',
            description: 'Campaign start date',
            example: '2024-01-15'
          },
          endDate: {
            type: 'string',
            format: 'date',
            description: 'Campaign end date',
            example: '2024-02-15'
          },
          manager: {
            type: 'string',
            description: 'Campaign manager name',
            example: 'John Smith'
          },
          adPlacementDomain: {
            type: 'string',
            description: 'Primary ad placement domain',
            example: 'google.com'
          },
          device: {
            type: 'string',
            enum: ['Desktop', 'Mobile', 'Both'],
            description: 'Target device type',
            example: 'Both'
          },
          targeting: {
            type: 'string',
            description: 'Geographic targeting',
            example: 'United States'
          },
          repContactInfo: {
            type: 'string',
            description: 'Representative contact information',
            example: 'rep@adtech.com'
          },
          metrics: {
            $ref: '#/components/schemas/CampaignMetrics'
          },
          notes: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/Note'
            }
          },
          documents: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/Document'
            }
          },
          visualMedia: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/VisualMedia'
            }
          },
          history: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/HistoryEntry'
            }
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Campaign creation timestamp'
          },
          modifiedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Last modification timestamp'
          }
        }
      },
      CampaignMetrics: {
        type: 'object',
        required: ['rawClicks', 'uniqueClicks', 'cost', 'rawReg', 'confirmReg', 'sales', 'orderValue', 'revenue', 'ltrev'],
        properties: {
          rawClicks: {
            type: 'integer',
            minimum: 0,
            description: 'Total raw clicks',
            example: 1250
          },
          uniqueClicks: {
            type: 'integer',
            minimum: 0,
            description: 'Unique clicks',
            example: 1000
          },
          cost: {
            type: 'number',
            format: 'float',
            minimum: 0,
            description: 'Campaign cost in USD',
            example: 2500.00
          },
          rawReg: {
            type: 'integer',
            minimum: 0,
            description: 'Raw registrations',
            example: 150
          },
          confirmReg: {
            type: 'integer',
            minimum: 0,
            description: 'Confirmed registrations',
            example: 120
          },
          sales: {
            type: 'integer',
            minimum: 0,
            description: 'Number of sales',
            example: 45
          },
          orderValue: {
            type: 'number',
            format: 'float',
            minimum: 0,
            description: 'Total order value',
            example: 4500.00
          },
          revenue: {
            type: 'number',
            format: 'float',
            description: 'Net revenue (can be negative)',
            example: 2000.00
          },
          ltrev: {
            type: 'number',
            format: 'float',
            minimum: 0,
            description: 'Lifetime revenue projection',
            example: 6750.00
          }
        }
      },
      Note: {
        type: 'object',
        required: ['id', 'text', 'user', 'timestamp'],
        properties: {
          id: {
            type: 'string',
            description: 'Unique note identifier',
            example: 'note_1640995200000'
          },
          text: {
            type: 'string',
            minLength: 1,
            maxLength: 1000,
            description: 'Note content',
            example: 'Campaign performing well, consider increasing budget'
          },
          user: {
            type: 'string',
            description: 'User who created the note',
            example: 'Marketing Manager'
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
            description: 'Note creation timestamp',
            example: '2024-01-15T10:30:00Z'
          }
        }
      },
      Document: {
        type: 'object',
        required: ['id', 'name', 'type', 'size', 'uploadDate', 'uploadedBy'],
        properties: {
          id: {
            type: 'string',
            description: 'Unique document identifier'
          },
          name: {
            type: 'string',
            description: 'Document filename',
            example: 'campaign-brief.pdf'
          },
          type: {
            type: 'string',
            description: 'MIME type',
            example: 'application/pdf'
          },
          size: {
            type: 'integer',
            minimum: 0,
            description: 'File size in bytes',
            example: 1048576
          },
          uploadDate: {
            type: 'string',
            format: 'date-time',
            description: 'Upload timestamp'
          },
          uploadedBy: {
            type: 'string',
            description: 'User who uploaded the document',
            example: 'John Smith'
          },
          data: {
            type: 'string',
            description: 'Base64 encoded file data or URL'
          },
          isImage: {
            type: 'boolean',
            description: 'Whether the document is an image'
          }
        }
      },
      VisualMedia: {
        type: 'object',
        required: ['id', 'url', 'description', 'addedDate', 'addedBy'],
        properties: {
          id: {
            type: 'string',
            description: 'Unique media identifier'
          },
          url: {
            type: 'string',
            format: 'uri',
            description: 'Media URL',
            example: 'https://example.com/banner-728x90.png'
          },
          description: {
            type: 'string',
            description: 'Media description',
            example: 'Banner Ad 728x90'
          },
          addedDate: {
            type: 'string',
            format: 'date-time',
            description: 'Date media was added'
          },
          addedBy: {
            type: 'string',
            description: 'User who added the media',
            example: 'Creative Team'
          }
        }
      },
      HistoryEntry: {
        type: 'object',
        required: ['id', 'action', 'user', 'timestamp'],
        properties: {
          id: {
            type: 'string',
            description: 'Unique history entry identifier'
          },
          action: {
            type: 'string',
            description: 'Description of the action taken',
            example: 'Campaign status changed from Paused to Live'
          },
          user: {
            type: 'string',
            description: 'User who performed the action',
            example: 'Marketing Manager'
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
            description: 'Action timestamp'
          }
        }
      },
      CampaignList: {
        type: 'object',
        properties: {
          data: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/Campaign'
            }
          },
          meta: {
            $ref: '#/components/schemas/PaginationMeta'
          }
        }
      },
      PaginationMeta: {
        type: 'object',
        properties: {
          total: {
            type: 'integer',
            minimum: 0,
            description: 'Total number of items',
            example: 150
          },
          page: {
            type: 'integer',
            minimum: 1,
            description: 'Current page number',
            example: 1
          },
          limit: {
            type: 'integer',
            minimum: 1,
            maximum: 100,
            description: 'Items per page',
            example: 10
          },
          pages: {
            type: 'integer',
            minimum: 1,
            description: 'Total number of pages',
            example: 15
          }
        }
      },
      Error: {
        type: 'object',
        required: ['error'],
        properties: {
          error: {
            type: 'object',
            properties: {
              code: {
                type: 'string',
                description: 'Error code',
                example: 'VALIDATION_ERROR'
              },
              message: {
                type: 'string',
                description: 'Human-readable error message',
                example: 'Campaign name is required'
              },
              details: {
                type: 'object',
                description: 'Additional error details',
                additionalProperties: true
              }
            }
          }
        }
      }
    },
    parameters: {
      CampaignId: {
        name: 'id',
        in: 'path',
        required: true,
        description: 'Campaign ID',
        schema: {
          type: 'string',
          example: 'CMP-2024-001'
        }
      },
      Page: {
        name: 'page',
        in: 'query',
        description: 'Page number',
        schema: {
          type: 'integer',
          minimum: 1,
          default: 1
        }
      },
      Limit: {
        name: 'limit',
        in: 'query',
        description: 'Number of items per page',
        schema: {
          type: 'integer',
          minimum: 1,
          maximum: 100,
          default: 10
        }
      },
      VendorFilter: {
        name: 'vendor',
        in: 'query',
        description: 'Filter by vendor name',
        schema: {
          type: 'string'
        }
      },
      StatusFilter: {
        name: 'status',
        in: 'query',
        description: 'Filter by campaign status',
        schema: {
          type: 'string',
          enum: ['Live', 'Paused', 'Ended']
        }
      },
      DateRangeStart: {
        name: 'startDate',
        in: 'query',
        description: 'Filter campaigns starting from this date',
        schema: {
          type: 'string',
          format: 'date'
        }
      },
      DateRangeEnd: {
        name: 'endDate',
        in: 'query',
        description: 'Filter campaigns ending before this date',
        schema: {
          type: 'string',
          format: 'date'
        }
      }
    },
    responses: {
      NotFound: {
        description: 'Resource not found',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error'
            },
            example: {
              error: {
                code: 'NOT_FOUND',
                message: 'Campaign not found'
              }
            }
          }
        }
      },
      ValidationError: {
        description: 'Validation error',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error'
            },
            example: {
              error: {
                code: 'VALIDATION_ERROR',
                message: 'Validation failed',
                details: {
                  name: 'Campaign name is required',
                  startDate: 'Start date must be a valid date'
                }
              }
            }
          }
        }
      },
      ServerError: {
        description: 'Internal server error',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error'
            },
            example: {
              error: {
                code: 'INTERNAL_ERROR',
                message: 'An unexpected error occurred'
              }
            }
          }
        }
      }
    }
  }
}

// Options for swagger-jsdoc
const options = {
  definition: swaggerDefinition,
  apis: [
    './src/api/endpoints/*.js',
    './src/api/mock/*.js'
  ]
}

// Generate OpenAPI specification
const specs = swaggerJSDoc(options)

// Write to file
const outputPath = path.join(process.cwd(), 'openapi.json')
fs.writeFileSync(outputPath, JSON.stringify(specs, null, 2))

console.log(`✅ OpenAPI specification generated: ${outputPath}`)

// Generate human-readable summary
const endpointCount = Object.keys(specs.paths || {}).length
const schemaCount = Object.keys(specs.components?.schemas || {}).length

console.log(`📊 API Summary:`)
console.log(`   - ${endpointCount} endpoints`)
console.log(`   - ${schemaCount} schemas`)
console.log(`   - ${specs.tags?.length || 0} tags`)
```

### Documented API Endpoints (`src/api/endpoints/campaigns.js`)
```javascript
/**
 * @swagger
 * /campaigns:
 *   get:
 *     summary: List all campaigns
 *     description: Retrieve a paginated list of marketing campaigns with optional filtering and sorting
 *     tags: [Campaigns]
 *     parameters:
 *       - $ref: '#/components/parameters/Page'
 *       - $ref: '#/components/parameters/Limit'
 *       - $ref: '#/components/parameters/VendorFilter'
 *       - $ref: '#/components/parameters/StatusFilter'
 *       - $ref: '#/components/parameters/DateRangeStart'
 *       - $ref: '#/components/parameters/DateRangeEnd'
 *       - name: search
 *         in: query
 *         description: Search campaigns by name or ID
 *         schema:
 *           type: string
 *       - name: sortBy
 *         in: query
 *         description: Sort field
 *         schema:
 *           type: string
 *           enum: [name, status, startDate, endDate, cost, revenue, roas]
 *           default: revenue
 *       - name: sortOrder
 *         in: query
 *         description: Sort order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CampaignList'
 *             example:
 *               data:
 *                 - id: "CMP-2024-001"
 *                   name: "Summer Sale Campaign"
 *                   vendor: "AdTech Solutions"
 *                   status: "Live"
 *                   startDate: "2024-01-15"
 *                   endDate: "2024-02-15"
 *                   metrics:
 *                     rawClicks: 1250
 *                     uniqueClicks: 1000
 *                     cost: 2500.00
 *                     revenue: 3200.00
 *               meta:
 *                 total: 150
 *                 page: 1
 *                 limit: 10
 *                 pages: 15
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   post:
 *     summary: Create a new campaign
 *     description: Create a new marketing campaign with the provided details
 *     tags: [Campaigns]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, vendor, status, startDate, endDate]
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 255
 *               vendor:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [Live, Paused, Ended]
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               manager:
 *                 type: string
 *               adPlacementDomain:
 *                 type: string
 *               device:
 *                 type: string
 *                 enum: [Desktop, Mobile, Both]
 *               targeting:
 *                 type: string
 *               repContactInfo:
 *                 type: string
 *           example:
 *             name: "Holiday Promotion"
 *             vendor: "MediaBuy Pro"
 *             status: "Paused"
 *             startDate: "2024-12-01"
 *             endDate: "2024-12-31"
 *             manager: "Sarah Johnson"
 *             device: "Both"
 *             targeting: "United States"
 *     responses:
 *       201:
 *         description: Campaign created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Campaign'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     created:
 *                       type: boolean
 *                       example: true
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /campaigns/{id}:
 *   get:
 *     summary: Get campaign by ID
 *     description: Retrieve detailed information about a specific campaign
 *     tags: [Campaigns]
 *     parameters:
 *       - $ref: '#/components/parameters/CampaignId'
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Campaign'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     lastModified:
 *                       type: string
 *                       format: date-time
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   put:
 *     summary: Update campaign
 *     description: Update an existing campaign with new information
 *     tags: [Campaigns]
 *     parameters:
 *       - $ref: '#/components/parameters/CampaignId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Campaign'
 *     responses:
 *       200:
 *         description: Campaign updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Campaign'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     updated:
 *                       type: boolean
 *                       example: true
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   delete:
 *     summary: Delete campaign
 *     description: Delete a campaign and all associated data
 *     tags: [Campaigns]
 *     parameters:
 *       - $ref: '#/components/parameters/CampaignId'
 *     responses:
 *       204:
 *         description: Campaign deleted successfully
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /campaigns/{id}/notes:
 *   post:
 *     summary: Add note to campaign
 *     description: Add a new note to the specified campaign
 *     tags: [Campaigns]
 *     parameters:
 *       - $ref: '#/components/parameters/CampaignId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [text, user]
 *             properties:
 *               text:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 1000
 *               user:
 *                 type: string
 *           example:
 *             text: "Campaign is performing above expectations"
 *             user: "Marketing Manager"
 *     responses:
 *       201:
 *         description: Note added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 note:
 *                   $ref: '#/components/schemas/Note'
 *                 historyEntry:
 *                   $ref: '#/components/schemas/HistoryEntry'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

// ... existing campaign API implementation
```

### Schema Validation Script (`scripts/validate-openapi.js`)
```javascript
const SwaggerParser = require('@apidevtools/swagger-parser')
const fs = require('fs')
const path = require('path')

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
```

## Testing Criteria
- [ ] OpenAPI schema generates without errors
- [ ] Generated schema passes validation
- [ ] All API endpoints are documented with proper schemas
- [ ] Request/response examples are comprehensive
- [ ] Schema includes proper error responses
- [ ] Generated documentation is accurate and complete
- [ ] NPM scripts work correctly
- [ ] Schema can be used with swagger-ui

## Definition of Done
- Complete OpenAPI 3.0 schema generated from mock API
- All endpoints documented with comprehensive JSDoc comments
- Schema validation passes without errors
- Request/response schemas match actual API behavior
- Examples provided for all major operations
- NPM scripts for generation, validation, and serving
- Foundation ready for SDK generation and interactive docs

## Files to Create
- `scripts/generate-openapi.js`
- `scripts/validate-openapi.js`
- Update `src/api/endpoints/campaigns.js` with JSDoc comments
- Update `package.json` with documentation scripts
- `openapi.json` (generated file)

## Dependencies
- Completed Phase 2 (Professional Frontend)
- Mock API service with all endpoints

## Estimated Time
6-8 hours