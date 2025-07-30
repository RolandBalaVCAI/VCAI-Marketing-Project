# Phase 1 Task 2: Create Mock API Service

## Objective
Create a comprehensive mock API service that simulates real REST endpoints for campaign management, providing proper HTTP methods, status codes, and realistic response delays.

## Current State
- Data generated inline within components using `generateMockData()` function
- No separation between data generation and UI consumption
- No API-like interface for data operations

## Target State
- Mock API service with RESTful endpoints
- Proper HTTP methods (GET, POST, PUT, DELETE)
- Realistic response delays and error simulation
- Structured data models matching real-world API patterns

## Implementation Steps

### 1. Install Dependencies
```bash
npm install zustand axios
```

### 2. Create Mock Data Models
Create `src/api/mock/data/campaigns.js`:
- Extract and enhance the `generateMockData()` function
- Add data relationships (vendors, managers, etc.)
- Include proper data validation

### 3. Create Mock Server Interface
Create `src/api/mock/server.js`:
- Simulate HTTP methods and status codes
- Add realistic delays (100-500ms)
- Include error scenarios (network errors, validation errors)
- Implement pagination for large datasets

### 4. Define API Endpoints
Create `src/api/endpoints/campaigns.js`:
- `GET /api/campaigns` - List campaigns with filtering
- `GET /api/campaigns/:id` - Get single campaign
- `POST /api/campaigns` - Create new campaign
- `PUT /api/campaigns/:id` - Update campaign
- `DELETE /api/campaigns/:id` - Delete campaign
- `POST /api/campaigns/:id/notes` - Add note
- `POST /api/campaigns/:id/documents` - Upload document
- `POST /api/campaigns/:id/media` - Add visual media

### 5. Create API Client
Create `src/api/client.js`:
- Axios-based HTTP client
- Request/response interceptors
- Error handling and retry logic
- Loading state management

## REST API Structure

### Campaigns Endpoint
```javascript
// GET /api/campaigns?page=1&limit=10&vendor=AdTech&status=Live
{
  "data": [...campaigns],
  "meta": {
    "total": 150,
    "page": 1,
    "limit": 10,
    "pages": 15
  }
}

// GET /api/campaigns/:id
{
  "data": { ...campaign },
  "meta": { "lastModified": "2024-01-15T10:30:00Z" }
}

// POST /api/campaigns
{
  "data": { ...newCampaign },
  "meta": { "created": true }
}
```

### Error Responses
```javascript
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Campaign name is required",
    "details": { "field": "name", "value": "" }
  }
}
```

## Key Features to Implement

### 1. Data Persistence
- Use localStorage to persist changes between sessions
- Maintain data relationships and integrity

### 2. Realistic API Behavior
- Simulate network delays
- Return appropriate HTTP status codes
- Include pagination metadata
- Handle concurrent requests properly

### 3. Error Scenarios
- Network timeouts (5% chance)
- Validation errors for invalid data
- 401/403 for authorization scenarios
- 500 errors for server issues (1% chance)

### 4. Filtering and Sorting
- Support query parameters for filtering
- Implement server-side sorting
- Include search functionality

## Testing Criteria
- [ ] All endpoints return properly formatted responses
- [ ] Error scenarios work as expected
- [ ] Data persistence works between page refreshes
- [ ] Filtering and pagination work correctly
- [ ] Response times are realistic (100-500ms)
- [ ] Concurrent requests handled properly

## Definition of Done
- Complete mock API service with RESTful endpoints
- All CRUD operations for campaigns implemented
- Error handling and validation in place
- Data persistence using localStorage
- Realistic network behavior simulation
- Proper response formatting with metadata
- Support for filtering, sorting, and pagination

## Files to Create
- `src/api/mock/data/campaigns.js`
- `src/api/mock/data/vendors.js`
- `src/api/mock/server.js`
- `src/api/endpoints/campaigns.js`
- `src/api/endpoints/index.js`
- `src/api/client.js`

## Dependencies
- Completed Phase 1 Task 1 (Project Structure)
- npm packages: zustand, axios

## Estimated Time
4-6 hours