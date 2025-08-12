# Grievance Management System API Documentation

## Overview
This document describes the REST API endpoints for the Grievance Management System, including data capture, validation, analytics, and reporting features.

## Base URL
```
http://localhost:3001/api
```

## Authentication
All endpoints require proper authentication. Include user session information in requests.

## Core Grievance Endpoints

### 1. Create Grievance
**POST** `/grievances`

Creates a new grievance with automatic reference number generation and validation.

**Request Body:**
```json
{
  "title": "Road Repair on Main Street",
  "description": "Large potholes causing traffic issues and safety concerns",
  "priority": "HIGH",
  "requesterName": "Rajesh Kumar",
  "requesterPhone": "9876543210",
  "requesterEmail": "rajesh@example.com",
  "requesterAddress": "123 Main Street, Hyderabad",
  "village": "Hyderabad",
  "mandal": "Secunderabad",
  "district": "Hyderabad",
  "state": "Telangana",
  "pincode": "500003",
  "latitude": 17.3850,
  "longitude": 78.4867,
  "estimatedCost": 50000,
  "expectedResolutionDate": "2024-02-15T00:00:00.000Z",
  "categoryId": "category_id_here"
}
```

**Response:**
```json
{
  "id": "grievance_id",
  "referenceNumber": "GRV-2024-0001",
  "title": "Road Repair on Main Street",
  "status": "PENDING",
  "priority": "HIGH",
  "requesterName": "Rajesh Kumar",
  "requesterPhone": "9876543210",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "category": { "name": "Infrastructure", "color": "#0ea5e9" },
  "assignedTo": null
}
```

### 2. Get Grievances
**GET** `/grievances`

Retrieves grievances with filtering, search, and pagination.

**Query Parameters:**
- `status`: Filter by status (PENDING, ASSIGNED, IN_PROGRESS, etc.)
- `priority`: Filter by priority (LOW, MEDIUM, HIGH, URGENT)
- `category`: Filter by category name
- `district`: Filter by district
- `assignedTo`: Filter by assigned user ID
- `search`: Search in title, description, requester name, or reference number
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

**Example:**
```
GET /grievances?status=PENDING&priority=HIGH&district=Hyderabad&page=1&limit=10
```

### 3. Get Single Grievance
**GET** `/grievances/{id}`

Retrieves detailed information about a specific grievance including status updates and audit logs.

**Response:**
```json
{
  "id": "grievance_id",
  "referenceNumber": "GRV-2024-0001",
  "title": "Road Repair on Main Street",
  "description": "Large potholes causing traffic issues",
  "status": "IN_PROGRESS",
  "priority": "HIGH",
  "requesterName": "Rajesh Kumar",
  "requesterPhone": "9876543210",
  "village": "Hyderabad",
  "mandal": "Secunderabad",
  "district": "Hyderabad",
  "estimatedCost": 50000,
  "category": { "name": "Infrastructure", "color": "#0ea5e9" },
  "assignedTo": {
    "id": "user_id",
    "name": "Field Officer",
    "phone": "9876543213",
    "email": "field@example.com"
  },
  "attachments": [...],
  "statusUpdates": [
    {
      "id": "update_id",
      "oldStatus": "PENDING",
      "newStatus": "ASSIGNED",
      "remarks": "Assigned to field officer",
      "createdAt": "2024-01-15T11:00:00.000Z",
      "user": { "name": "Admin User", "phone": "9876543210" }
    }
  ]
}
```

### 4. Update Grievance
**PUT** `/grievances/{id}`

Updates grievance information with validation and audit logging.

**Request Body:**
```json
{
  "title": "Updated Road Repair Request",
  "priority": "URGENT",
  "assignedToId": "user_id_here",
  "statusRemarks": "Escalated due to safety concerns"
}
```

### 5. Update Grievance Status
**POST** `/grievances/{id}/status`

Updates grievance status with transition validation and tracking.

**Request Body:**
```json
{
  "newStatus": "IN_PROGRESS",
  "remarks": "Work has started on the road repair",
  "actualResolutionDate": "2024-02-15T00:00:00.000Z"
}
```

**Status Transitions:**
- PENDING → ASSIGNED, REJECTED
- ASSIGNED → IN_PROGRESS, REJECTED
- IN_PROGRESS → UNDER_REVIEW, REJECTED
- UNDER_REVIEW → RESOLVED, IN_PROGRESS, REJECTED
- RESOLVED → CLOSED, IN_PROGRESS
- CLOSED → (terminal state)
- REJECTED → PENDING (can be reopened)

### 6. Upload Attachments
**POST** `/grievances/{id}/attachments`

Uploads files with validation for type and size.

**Request Body:**
```json
{
  "fileName": "road_condition.jpg",
  "originalName": "road_condition.jpg",
  "url": "https://storage.example.com/files/road_condition.jpg",
  "mimeType": "image/jpeg",
  "fileSize": 2048576,
  "uploadedBy": "user_id"
}
```

**Allowed File Types:**
- Images: JPEG, PNG, GIF, WebP
- Documents: PDF, Word, Excel, Text files
- Maximum size: 10MB

## Analytics Endpoints

### 1. Constituency Analytics
**GET** `/analytics/constituency`

Provides comprehensive analytics for a specific constituency or district.

**Query Parameters:**
- `constituency`: Constituency/district name
- `district`: District name (alternative to constituency)
- `mandal`: Mandal name (optional filter)
- `year`: Year for analysis (default: current year)

**Example:**
```
GET /analytics/constituency?constituency=Hyderabad&year=2024
```

**Response:**
```json
{
  "constituency": "Hyderabad",
  "year": 2024,
  "totalGrievances": 1247,
  "statusDistribution": {
    "PENDING": 156,
    "IN_PROGRESS": 89,
    "RESOLVED": 892,
    "CLOSED": 110
  },
  "priorityDistribution": {
    "LOW": 234,
    "MEDIUM": 567,
    "HIGH": 345,
    "URGENT": 101
  },
  "fundSpending": [
    {
      "district": "Hyderabad",
      "mandal": "Secunderabad",
      "village": "Hyderabad",
      "totalCost": 2500000,
      "grievanceCount": 45
    }
  ],
  "topVillagesPending": [
    {
      "village": "Hyderabad",
      "mandal": "Secunderabad",
      "district": "Hyderabad",
      "pendingCount": 23
    }
  ],
  "monthlyTrend": [...],
  "totalFundSpent": 15000000,
  "pendingGrievances": 156,
  "resolvedGrievances": 892
}
```

### 2. Critical Grievances
**GET** `/analytics/critical-grievances`

Retrieves critical grievances (urgent/high priority) with officer contact details.

**Query Parameters:**
- `district`: Filter by district
- `mandal`: Filter by mandal
- `priority`: Filter by priority
- `status`: Filter by status
- `limit`: Items per page (default: 50)
- `page`: Page number (default: 1)

**Response:**
```json
{
  "criticalGrievances": [
    {
      "id": "grievance_id",
      "referenceNumber": "GRV-2024-0001",
      "title": "Road Repair on Main Street",
      "priority": "URGENT",
      "status": "IN_PROGRESS",
      "daysSinceCreation": 5,
      "isOverdue": false,
      "assignedTo": {
        "name": "Field Officer",
        "phone": "9876543213",
        "email": "field@example.com",
        "role": "FIELD_OFFICER"
      },
      "statusUpdates": [...]
    }
  ],
  "summary": {
    "totalCriticalGrievances": 45,
    "averageEstimatedCost": 75000,
    "priorityBreakdown": { "HIGH": 30, "URGENT": 15 },
    "officerWorkload": [
      {
        "officerName": "Field Officer",
        "officerPhone": "9876543213",
        "grievanceCount": 12
      }
    ]
  }
}
```

### 3. Aggregated Data
**GET** `/analytics/aggregated`

Provides SQL-like aggregation of grievances grouped by location.

**Query Parameters:**
- `groupBy`: Grouping level (district, mandal, village)
- `constituency`: Filter by constituency
- `year`: Year for analysis (default: current year)
- `status`: Filter by status
- `priority`: Filter by priority

**Example:**
```
GET /analytics/aggregated?groupBy=village&constituency=Hyderabad&year=2024
```

**Response:**
```json
{
  "groupBy": "village",
  "constituency": "Hyderabad",
  "year": 2024,
  "aggregatedData": [
    {
      "key": "Hyderabad - Secunderabad - Hyderabad",
      "location": {
        "district": "Hyderabad",
        "mandal": "Secunderabad",
        "village": "Hyderabad"
      },
      "totalGrievances": 45,
      "totalEstimatedCost": 2500000,
      "averageEstimatedCost": 55555.56,
      "statusBreakdown": {
        "PENDING": 5,
        "IN_PROGRESS": 8,
        "RESOLVED": 32
      },
      "priorityBreakdown": {
        "LOW": 10,
        "MEDIUM": 20,
        "HIGH": 15
      }
    }
  ],
  "summary": {
    "totalGrievances": 1247,
    "totalEstimatedCost": 15000000,
    "resolutionRate": "71.5"
  }
}
```

### 4. Dashboard Analytics
**GET** `/analytics/dashboard`

Comprehensive dashboard with KPIs, trends, and summary data.

**Query Parameters:**
- `constituency`: Filter by constituency
- `district`: Filter by district
- `year`: Year for analysis (default: current year)
- `month`: Month for analysis (optional)

**Response:**
```json
{
  "period": {
    "year": 2024,
    "constituency": "Hyderabad"
  },
  "kpis": {
    "totalGrievances": 1247,
    "totalEstimatedCost": 15000000,
    "criticalGrievances": 45,
    "overdueGrievances": 12,
    "resolutionRate": "71.5",
    "averageResolutionTime": "3.2"
  },
  "distributions": {
    "status": { "PENDING": 156, "IN_PROGRESS": 89, "RESOLVED": 892 },
    "priority": { "LOW": 234, "MEDIUM": 567, "HIGH": 345, "URGENT": 101 },
    "category": [
      {
        "categoryName": "Infrastructure",
        "categoryColor": "#0ea5e9",
        "count": 456
      }
    ]
  },
  "trends": {
    "monthly": [...]
  },
  "recentActivity": {
    "recentGrievances": [...]
  },
  "officerWorkload": [
    {
      "officerName": "Field Officer",
      "officerPhone": "9876543213",
      "grievanceCount": 25
    }
  ]
}
```

## Validation Rules

### Grievance Creation Validation
- **Title**: 5-200 characters
- **Description**: 10-2000 characters
- **Requester Name**: 2-100 characters
- **Requester Phone**: Exactly 10 digits
- **Requester Email**: Valid email format (optional)
- **Village/Mandal/District**: 2-100 characters each
- **Pincode**: Exactly 6 digits
- **Latitude**: -90 to 90
- **Longitude**: -180 to 180
- **Estimated Cost**: Positive number
- **Category ID**: Valid CUID format

### File Upload Validation
- **File Size**: Maximum 10MB
- **File Types**: Images (JPEG, PNG, GIF, WebP), Documents (PDF, Word, Excel, Text)
- **File Name**: 1-255 characters
- **MIME Type**: Required and validated

### Status Transition Validation
- Only valid status transitions are allowed
- Status changes are logged with timestamps and user information
- Remarks are required for status updates

## Error Responses

### Validation Error (400)
```json
{
  "error": "Validation failed",
  "details": [
    {
      "path": ["requesterPhone"],
      "message": "Phone number must be exactly 10 digits"
    }
  ]
}
```

### Not Found Error (404)
```json
{
  "error": "Grievance not found"
}
```

### Server Error (500)
```json
{
  "error": "Failed to fetch grievances"
}
```

## Reference Number Format
Grievances are automatically assigned reference numbers in the format:
```
GRV-YYYY-XXXX
```
Where:
- GRV: Fixed prefix
- YYYY: Year (e.g., 2024)
- XXXX: Sequential number padded with zeros (e.g., 0001, 0002)

## Audit Logging
All operations are automatically logged with:
- Action type (CREATE, UPDATE, DELETE, STATUS_CHANGE)
- Entity type and ID
- User ID
- Timestamp
- IP address and user agent
- Old and new values (for updates)

## Rate Limiting
- API requests are limited to 100 requests per minute per user
- File uploads are limited to 10 files per minute per user

## Security Considerations
- All endpoints require authentication
- Input validation prevents SQL injection and XSS attacks
- File uploads are validated for type and size
- Sensitive data is not exposed in responses
- Audit logs track all system activities
