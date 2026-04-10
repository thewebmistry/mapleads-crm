# Lead Management API

This document describes the Lead Management API endpoints for the MapLeads CRM system.

## Base URL
```
http://localhost:5000/api/v1
```

## Lead Model Fields

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| businessName | String | Yes | Name of the business | max 200 chars |
| ownerName | String | Yes | Name of the business owner | max 100 chars |
| district | String | Yes | District/Location of business | max 100 chars |
| whatsapp | String | Yes | WhatsApp contact number | International format |
| email | String | Yes | Email address | Valid email format |
| firstMessage | String | No | Initial contact message | max 1000 chars |
| followUp | String | No | Follow-up notes | max 1000 chars |
| status | String | No | Lead status | Enum: new, contacted, qualified, proposal, negotiation, won, lost, archived |
| remark | String | No | Additional remarks | max 500 chars |
| createdAt | Date | Auto | Creation timestamp | Auto-generated |
| updatedAt | Date | Auto | Last update timestamp | Auto-generated |

## API Endpoints

### 1. Get All Leads
**GET** `/leads`

Returns a paginated list of leads with filtering, sorting, and search capabilities.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `sortBy` (optional): Field to sort by (default: createdAt)
- `sortOrder` (optional): Sort order: asc/desc (default: desc)
- `status` (optional): Filter by status
- `district` (optional): Filter by district (case-insensitive partial match)
- `search` (optional): Search across businessName, ownerName, email, whatsapp

**Response:**
```json
{
  "success": true,
  "count": 5,
  "total": 25,
  "page": 1,
  "totalPages": 3,
  "data": [...],
  "stats": [...],
  "pagination": {
    "current": 1,
    "total": 3,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### 2. Get Lead Statistics
**GET** `/leads/stats/summary`

Returns lead statistics including counts by status, today's leads, and monthly totals.

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 125,
    "today": 5,
    "thisMonth": 45,
    "byStatus": [
      { "status": "new", "count": 45 },
      { "status": "contacted", "count": 32 }
    ]
  }
}
```

### 3. Get Single Lead
**GET** `/leads/:id`

Returns a single lead by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "60d21b4667d0d8992e610c85",
    "businessName": "Tech Solutions Inc",
    "ownerName": "John Doe",
    // ... other fields
  }
}
```

### 4. Create Lead
**POST** `/leads`

Creates a new lead.

**Request Body:**
```json
{
  "businessName": "Tech Solutions Inc",
  "ownerName": "John Doe",
  "district": "Mumbai",
  "whatsapp": "+919876543210",
  "email": "john@techsolutions.com",
  "firstMessage": "Interested in your CRM software",
  "followUp": "Schedule demo next week",
  "status": "new",
  "remark": "High potential lead"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Lead created successfully",
  "data": { ... }
}
```

### 5. Update Lead
**PUT** `/leads/:id`

Updates an existing lead (full update).

**Request Body:** (include all fields you want to update)
```json
{
  "businessName": "Updated Business Name",
  "status": "qualified",
  "followUp": "Updated follow-up notes"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Lead updated successfully",
  "data": { ... }
}
```

### 6. Partial Update Lead
**PATCH** `/leads/:id`

Partially updates an existing lead (only specified fields).

**Request Body:** (include only fields to update)
```json
{
  "status": "won",
  "remark": "Deal closed successfully"
}
```

### 7. Delete Lead
**DELETE** `/leads/:id`

Deletes a lead by ID.

**Response:**
```json
{
  "success": true,
  "message": "Lead deleted successfully",
  "data": {}
}
```

## Error Responses

### Validation Error (400)
```json
{
  "success": false,
  "error": "Validation Error",
  "details": [
    "Business name is required",
    "Invalid email format"
  ]
}
```

### Not Found (404)
```json
{
  "success": false,
  "error": "Lead not found"
}
```

### Server Error (500)
```json
{
  "success": false,
  "error": "Server Error",
  "message": "Detailed error message"
}
```

## Status Values

Leads can have one of the following status values:

- `new`: New lead, not yet contacted
- `contacted`: Initial contact made
- `qualified`: Lead qualified for sales process
- `proposal`: Proposal sent to lead
- `negotiation`: Negotiation in progress
- `won`: Deal won/closed successfully
- `lost`: Deal lost to competition
- `archived`: Lead archived (inactive)

## Testing the API

Use the provided `test-lead-api.http` file with VS Code REST Client extension or use curl commands:

```bash
# Get all leads
curl -X GET http://localhost:5000/api/v1/leads

# Create a lead
curl -X POST http://localhost:5000/api/v1/leads \
  -H "Content-Type: application/json" \
  -d '{
    "businessName": "Test Business",
    "ownerName": "Test Owner",
    "district": "Test District",
    "whatsapp": "+919876543210",
    "email": "test@example.com",
    "status": "new"
  }'
```

## Notes

1. All timestamps are in ISO 8601 format
2. The API supports CORS for development (localhost:3000, localhost:5500)
3. MongoDB connection is required for the API to work
4. The API includes comprehensive error handling and validation
5. Pagination metadata is included in list responses