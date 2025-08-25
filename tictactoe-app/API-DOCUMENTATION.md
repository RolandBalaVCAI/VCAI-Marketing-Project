# Marketing Campaign Manager API Documentation

## Table of Contents
1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Base URL](#base-url)
4. [Error Handling](#error-handling)
5. [API Endpoints](#api-endpoints)
   - [Campaign Management](#campaign-management)
   - [Campaign Notes](#campaign-notes)
   - [Campaign Documents](#campaign-documents)
   - [Campaign Media](#campaign-media)
   - [System Utilities](#system-utilities)
6. [Data Models](#data-models)
7. [Request/Response Examples](#requestresponse-examples)
8. [Error Codes](#error-codes)
9. [Rate Limiting](#rate-limiting)
10. [Webhooks](#webhooks)

## Overview

The Marketing Campaign Manager API provides a RESTful interface for managing marketing campaigns, including creating, updating, retrieving, and deleting campaign data. The API supports comprehensive campaign management features including metrics tracking, document uploads, media management, and detailed change history.

### Key Features
- **RESTful Design**: Follows REST principles for predictable and intuitive API design
- **JSON Format**: All requests and responses use JSON format
- **Comprehensive Error Handling**: Detailed error messages with categorization
- **Automatic Retries**: Built-in retry logic for transient failures
- **Request Tracking**: Every request gets a unique ID for debugging
- **Performance Monitoring**: Request timing and performance metrics

## Authentication

The API uses Bearer token authentication. Include your API token in the Authorization header of all requests:

```http
Authorization: Bearer YOUR_API_TOKEN
```

### Obtaining an API Token
```javascript
// Currently stored in localStorage
const token = localStorage.getItem('auth_token');
```

### Token Expiration
Tokens expire after 24 hours. When a token expires, the API returns a 401 status code.

## Base URL

```
Development: http://localhost:5173/api
Production: https://api.marketing-campaign-manager.com/v1
```

## Error Handling

The API uses standard HTTP status codes and provides detailed error information in the response body.

### Error Response Format
```json
{
  "error": {
    "id": "error_1234567890_abc123",
    "category": "validation",
    "severity": "low",
    "message": "Please check your input and try again.",
    "technicalMessage": "Invalid campaign name: must be between 3 and 100 characters",
    "timestamp": "2025-01-31T10:30:00Z",
    "context": {
      "operation": "createCampaign",
      "requestId": "req_1234567890_xyz789"
    },
    "isRetryable": false,
    "validationErrors": {
      "name": "Campaign name is required"
    }
  }
}
```

### Error Categories
- `network`: Network connectivity issues
- `authentication`: Authentication failures
- `authorization`: Permission denied
- `validation`: Input validation errors
- `server`: Server-side errors
- `client`: Client request errors
- `timeout`: Request timeout
- `rate_limit`: Rate limit exceeded
- `maintenance`: Service under maintenance

## API Endpoints

### Campaign Management

#### List Campaigns
```http
GET /campaigns
```

Query Parameters:
- `page` (integer): Page number (default: 1)
- `limit` (integer): Items per page (default: 20, max: 100)
- `sort` (string): Sort field (e.g., `name`, `startDate`, `revenue`)
- `order` (string): Sort order (`asc` or `desc`)
- `status` (string): Filter by status (`Active`, `Paused`, `Completed`, `Draft`)
- `vendor` (string): Filter by vendor name
- `startDate` (string): Filter by start date (ISO 8601)
- `endDate` (string): Filter by end date (ISO 8601)
- `search` (string): Search in campaign names and IDs

Response:
```json
{
  "success": true,
  "data": {
    "campaigns": [
      {
        "id": "camp_1234567890",
        "name": "Summer Sale 2024",
        "status": "Active",
        "vendor": "Google Ads",
        "startDate": "2024-06-01T00:00:00Z",
        "endDate": "2024-08-31T23:59:59Z",
        "manager": "John Doe",
        "metrics": {
          "cost": 5000,
          "revenue": 15000,
          "rawClicks": 10000,
          "uniqueClicks": 8000,
          "impressions": 100000,
          "confirmReg": 500,
          "sales": 200
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 10,
      "totalItems": 200,
      "itemsPerPage": 20,
      "hasNextPage": true,
      "hasPreviousPage": false
    }
  }
}
```

#### Get Campaign by ID
```http
GET /campaigns/{campaignId}
```

Response:
```json
{
  "success": true,
  "data": {
    "campaign": {
      "id": "camp_1234567890",
      "name": "Summer Sale 2024",
      "status": "Active",
      "vendor": "Google Ads",
      "startDate": "2024-06-01T00:00:00Z",
      "endDate": "2024-08-31T23:59:59Z",
      "manager": "John Doe",
      "adPlacementDomain": "example.com",
      "device": ["desktop", "mobile"],
      "targeting": {
        "interests": ["technology", "shopping"],
        "demographics": {
          "ageRange": "25-54",
          "gender": "all"
        },
        "location": ["United States", "Canada"]
      },
      "repContactInfo": {
        "name": "Jane Smith",
        "email": "jane.smith@vendor.com",
        "phone": "+1-555-0123"
      },
      "metrics": {
        "cost": 5000,
        "revenue": 15000,
        "rawClicks": 10000,
        "uniqueClicks": 8000,
        "impressions": 100000,
        "confirmReg": 500,
        "sales": 200
      },
      "notes": [],
      "documents": [],
      "visualMedia": [],
      "changeHistory": []
    }
  }
}
```

#### Create Campaign
```http
POST /campaigns
```

Request Body:
```json
{
  "name": "Black Friday 2024",
  "status": "Draft",
  "vendor": "Facebook Ads",
  "startDate": "2024-11-25T00:00:00Z",
  "endDate": "2024-11-30T23:59:59Z",
  "manager": "John Doe",
  "adPlacementDomain": "shop.example.com",
  "device": ["desktop", "mobile", "tablet"],
  "targeting": {
    "interests": ["shopping", "deals"],
    "demographics": {
      "ageRange": "18-65",
      "gender": "all"
    },
    "location": ["United States"]
  },
  "repContactInfo": {
    "name": "Mike Johnson",
    "email": "mike@facebook.com",
    "phone": "+1-555-9876"
  }
}
```

Response:
```json
{
  "success": true,
  "data": {
    "campaign": {
      "id": "camp_9876543210",
      "name": "Black Friday 2024",
      "status": "Draft",
      // ... full campaign object
    }
  }
}
```

#### Update Campaign
```http
PUT /campaigns/{campaignId}
```

Request Body (partial update supported):
```json
{
  "status": "Active",
  "metrics": {
    "cost": 1000,
    "revenue": 3000
  }
}
```

Response:
```json
{
  "success": true,
  "data": {
    "campaign": {
      // ... updated campaign object
    },
    "changes": {
      "status": {
        "old": "Draft",
        "new": "Active"
      },
      "metrics.cost": {
        "old": 0,
        "new": 1000
      }
    }
  }
}
```

#### Delete Campaign
```http
DELETE /campaigns/{campaignId}
```

Response:
```json
{
  "success": true,
  "data": {
    "message": "Campaign deleted successfully",
    "deletedId": "camp_1234567890"
  }
}
```

### Campaign Notes

#### Add Note to Campaign
```http
POST /campaigns/{campaignId}/notes
```

Request Body:
```json
{
  "text": "Updated targeting parameters based on Q3 performance",
  "author": "John Doe"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "note": {
      "id": "note_1234567890",
      "text": "Updated targeting parameters based on Q3 performance",
      "author": "John Doe",
      "timestamp": "2025-01-31T10:45:00Z"
    }
  }
}
```

### Campaign Documents

#### Upload Document
```http
POST /campaigns/{campaignId}/documents
```

Request Body:
```json
{
  "name": "Q4 Strategy.pdf",
  "type": "application/pdf",
  "size": 2048576,
  "data": "base64_encoded_file_data",
  "uploadedBy": "John Doe"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "document": {
      "id": "doc_1234567890",
      "name": "Q4 Strategy.pdf",
      "type": "application/pdf",
      "size": 2048576,
      "uploadedBy": "John Doe",
      "uploadDate": "2025-01-31T11:00:00Z",
      "url": "/api/campaigns/camp_1234567890/documents/doc_1234567890"
    }
  }
}
```

#### Get Document
```http
GET /campaigns/{campaignId}/documents/{documentId}
```

#### Delete Document
```http
DELETE /campaigns/{campaignId}/documents/{documentId}
```

### Campaign Media

#### Add Visual Media
```http
POST /campaigns/{campaignId}/media
```

Request Body:
```json
{
  "name": "Banner Ad v2.jpg",
  "type": "image/jpeg",
  "url": "https://cdn.example.com/ads/banner-v2.jpg",
  "thumbnail": "base64_encoded_thumbnail",
  "uploadedBy": "Jane Doe"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "media": {
      "id": "media_1234567890",
      "name": "Banner Ad v2.jpg",
      "type": "image/jpeg",
      "url": "https://cdn.example.com/ads/banner-v2.jpg",
      "thumbnail": "base64_encoded_thumbnail",
      "uploadedBy": "Jane Doe",
      "uploadDate": "2025-01-31T11:15:00Z"
    }
  }
}
```

### System Utilities

#### Get Server Statistics
```http
GET /system/stats
```

Response:
```json
{
  "success": true,
  "data": {
    "totalCampaigns": 1523,
    "activeCampaigns": 456,
    "totalRevenue": 2500000,
    "totalCost": 750000,
    "averageROAS": 333.33,
    "lastUpdated": "2025-01-31T12:00:00Z",
    "apiVersion": "1.0.0",
    "serverTime": "2025-01-31T12:00:00Z"
  }
}
```

#### Reset Data (Development Only)
```http
POST /system/reset
```

Request Body:
```json
{
  "confirmation": "RESET_ALL_DATA"
}
```

## Data Models

### Campaign Model
```typescript
interface Campaign {
  id: string;
  name: string;
  status: 'Active' | 'Paused' | 'Completed' | 'Draft';
  vendor: string;
  startDate: string; // ISO 8601
  endDate: string; // ISO 8601
  manager: string;
  adPlacementDomain: string;
  device: ('desktop' | 'mobile' | 'tablet')[];
  targeting: {
    interests: string[];
    demographics: {
      ageRange: string;
      gender: string;
    };
    location: string[];
  };
  repContactInfo: {
    name: string;
    email: string;
    phone: string;
  };
  metrics: {
    cost: number;
    revenue: number;
    rawClicks: number;
    uniqueClicks: number;
    impressions: number;
    confirmReg: number;
    sales: number;
  };
  notes: Note[];
  documents: Document[];
  visualMedia: Media[];
  changeHistory: ChangeRecord[];
}
```

### Note Model
```typescript
interface Note {
  id: string;
  text: string;
  author: string;
  timestamp: string; // ISO 8601
}
```

### Document Model
```typescript
interface Document {
  id: string;
  name: string;
  type: string; // MIME type
  size: number; // bytes
  uploadedBy: string;
  uploadDate: string; // ISO 8601
  url: string;
}
```

### Media Model
```typescript
interface Media {
  id: string;
  name: string;
  type: string; // MIME type
  url: string;
  thumbnail: string; // base64
  uploadedBy: string;
  uploadDate: string; // ISO 8601
}
```

### Change Record Model
```typescript
interface ChangeRecord {
  id: string;
  timestamp: string; // ISO 8601
  user: string;
  changes: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
}
```

## Request/Response Examples

### Creating a Campaign with Full Details
```bash
curl -X POST https://api.marketing-campaign-manager.com/v1/campaigns \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Spring Collection Launch",
    "status": "Active",
    "vendor": "Instagram Ads",
    "startDate": "2024-03-01T00:00:00Z",
    "endDate": "2024-04-30T23:59:59Z",
    "manager": "Sarah Johnson",
    "adPlacementDomain": "spring.fashion.com",
    "device": ["mobile", "tablet"],
    "targeting": {
      "interests": ["fashion", "spring", "shopping"],
      "demographics": {
        "ageRange": "18-45",
        "gender": "female"
      },
      "location": ["United States", "United Kingdom", "Canada"]
    },
    "repContactInfo": {
      "name": "Alex Chen",
      "email": "alex.chen@instagram.com",
      "phone": "+1-555-1234"
    }
  }'
```

### Updating Campaign Metrics
```bash
curl -X PUT https://api.marketing-campaign-manager.com/v1/campaigns/camp_123456 \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "metrics": {
      "cost": 2500,
      "revenue": 7500,
      "rawClicks": 5000,
      "uniqueClicks": 4200,
      "impressions": 50000,
      "confirmReg": 150,
      "sales": 75
    }
  }'
```

### Adding a Note with Attachment Reference
```bash
curl -X POST https://api.marketing-campaign-manager.com/v1/campaigns/camp_123456/notes \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Weekly performance review completed. See attached report for details.",
    "author": "Marketing Team",
    "attachments": ["doc_789012"]
  }'
```

## Error Codes

### HTTP Status Codes
- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `204 No Content`: Request successful, no content to return
- `400 Bad Request`: Invalid request format or parameters
- `401 Unauthorized`: Authentication required or failed
- `403 Forbidden`: Access denied to resource
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource conflict (e.g., duplicate name)
- `422 Unprocessable Entity`: Validation errors
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error
- `502 Bad Gateway`: Gateway error
- `503 Service Unavailable`: Service temporarily unavailable

### Application Error Codes
- `E1001`: Invalid campaign name
- `E1002`: Invalid date range
- `E1003`: Missing required field
- `E1004`: Invalid status transition
- `E1005`: Campaign not found
- `E2001`: File size exceeds limit
- `E2002`: Unsupported file type
- `E3001`: Rate limit exceeded
- `E4001`: Database connection error
- `E4002`: External service unavailable

## Rate Limiting

The API implements rate limiting to ensure fair usage and system stability.

### Rate Limits
- **Default**: 1000 requests per hour
- **Authenticated**: 5000 requests per hour
- **Bulk Operations**: 100 requests per hour

### Rate Limit Headers
```http
X-RateLimit-Limit: 5000
X-RateLimit-Remaining: 4995
X-RateLimit-Reset: 1706698800
```

### Rate Limit Response
```json
{
  "error": {
    "category": "rate_limit",
    "message": "Too many requests. Please wait 42 seconds and try again.",
    "retryAfter": 42
  }
}
```

## Webhooks

Configure webhooks to receive real-time notifications about campaign events.

### Webhook Events
- `campaign.created`: New campaign created
- `campaign.updated`: Campaign details updated
- `campaign.deleted`: Campaign deleted
- `campaign.status_changed`: Campaign status changed
- `metrics.updated`: Campaign metrics updated
- `document.uploaded`: Document uploaded to campaign
- `media.added`: Media added to campaign

### Webhook Payload
```json
{
  "event": "campaign.updated",
  "timestamp": "2025-01-31T12:30:00Z",
  "data": {
    "campaignId": "camp_123456",
    "changes": {
      "status": {
        "old": "Draft",
        "new": "Active"
      }
    }
  },
  "webhook": {
    "id": "webhook_789012",
    "attempt": 1
  }
}
```

### Webhook Configuration
```http
POST /webhooks
```

Request Body:
```json
{
  "url": "https://your-app.com/webhooks/campaigns",
  "events": ["campaign.created", "campaign.updated"],
  "secret": "your_webhook_secret"
}
```

## SDK and Client Libraries

### JavaScript/TypeScript
```javascript
import { MarketingCampaignAPI } from '@marketing-campaign/sdk';

const api = new MarketingCampaignAPI({
  apiKey: 'YOUR_API_KEY',
  baseURL: 'https://api.marketing-campaign-manager.com/v1'
});

// Get campaigns
const campaigns = await api.campaigns.list({
  status: 'Active',
  sort: 'revenue',
  order: 'desc'
});

// Create campaign
const newCampaign = await api.campaigns.create({
  name: 'Holiday Sale 2024',
  vendor: 'Google Ads',
  // ... other fields
});
```

### Python
```python
from marketing_campaign_sdk import MarketingCampaignAPI

api = MarketingCampaignAPI(
    api_key='YOUR_API_KEY',
    base_url='https://api.marketing-campaign-manager.com/v1'
)

# Get campaigns
campaigns = api.campaigns.list(status='Active', sort='revenue', order='desc')

# Create campaign
new_campaign = api.campaigns.create(
    name='Holiday Sale 2024',
    vendor='Google Ads',
    # ... other fields
)
```

## Best Practices

1. **Always use HTTPS** in production
2. **Store API tokens securely** (never in client-side code)
3. **Implement retry logic** for transient failures
4. **Use pagination** for large datasets
5. **Cache responses** when appropriate
6. **Handle errors gracefully** with proper user feedback
7. **Monitor rate limits** and implement backoff strategies
8. **Validate input** before sending requests
9. **Use webhook signatures** to verify authenticity
10. **Log API interactions** for debugging

## Support

For API support, please contact:
- Email: api-support@marketing-campaign-manager.com
- Documentation: https://docs.marketing-campaign-manager.com
- Status Page: https://status.marketing-campaign-manager.com
- Developer Forum: https://forum.marketing-campaign-manager.com