# School Equipment Portal - API Documentation

## Overview

The School Equipment Portal API is a RESTful API built with Node.js and Express that provides backend services for a school equipment lending system. It supports role-based authentication and CRUD operations for users, equipment, and requests.

## Base URL
```
http://localhost:3001/api
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

## User Roles

- **Student**: Can view equipment and make requests
- **Staff**: Can manage equipment and approve/reject requests
- **Admin**: Full access to all operations including user management

## Test Users

| Username | Password | Role | Description |
|----------|----------|------|-------------|
| admin | admin123 | admin | Full system access |
| staff1 | admin123 | staff | Equipment and request management |
| student1 | admin123 | student | Equipment viewing and requests |

---

## Authentication Endpoints

### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@school.com",
  "password": "password123",
  "role": "student",
  "firstName": "John",
  "lastName": "Doe",
  "studentId": "STU001",
  "department": "Computer Science"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "user_id",
      "username": "johndoe",
      "email": "john@school.com",
      "role": "student",
      "firstName": "John",
      "lastName": "Doe"
    },
    "token": "jwt_token_here"
  }
}
```

### POST /auth/login
Login with username/email and password.

**Request Body:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "1",
      "username": "admin",
      "role": "admin",
      "firstName": "Admin",
      "lastName": "User"
    },
    "token": "jwt_token_here"
  }
}
```

### GET /auth/profile
Get current user profile (requires authentication).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "1",
    "username": "admin",
    "email": "admin@school.com",
    "role": "admin",
    "firstName": "Admin",
    "lastName": "User"
  }
}
```

### PUT /auth/profile
Update user profile (requires authentication).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "firstName": "Updated Name",
  "lastName": "Updated Last",
  "department": "Updated Department"
}
```

---

## User Management Endpoints (Admin Only)

### GET /auth/users
Get all users with pagination and filtering.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `role` (optional): Filter by role
- `search` (optional): Search by username, email, or name

**Example:**
```
GET /auth/users?page=1&limit=10&role=student&search=john
```

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "_id": "3",
        "username": "student1",
        "email": "student@school.com",
        "role": "student",
        "firstName": "John",
        "lastName": "Student",
        "isActive": true,
        "createdAt": "2023-01-03T00:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalUsers": 1,
      "hasNextPage": false,
      "hasPrevPage": false
    },
    "stats": {
      "totalUsers": 3,
      "activeUsers": 3,
      "inactiveUsers": 0,
      "roleDistribution": {
        "admin": 1,
        "staff": 1,
        "student": 1
      }
    }
  }
}
```

### POST /auth/users
Create a new user (Admin only).

**Request Body:**
```json
{
  "username": "newuser",
  "email": "newuser@school.com",
  "password": "password123",
  "role": "student",
  "firstName": "New",
  "lastName": "User",
  "studentId": "STU002",
  "department": "Engineering"
}
```

### PUT /auth/users/:id
Update an existing user (Admin only).

**Request Body:**
```json
{
  "firstName": "Updated",
  "lastName": "Name",
  "role": "staff",
  "isActive": true
}
```

### PUT /auth/users/:id/toggle-activation
Toggle user activation status (Admin only).

**Response:**
```json
{
  "success": true,
  "message": "User activation status updated",
  "data": {
    "user": {
      "_id": "user_id",
      "isActive": false
    }
  }
}
```

### DELETE /auth/users/:id
Delete a user (Admin only).

---

## Equipment Endpoints

### GET /equipment
Get all equipment with filtering and pagination.

**Query Parameters:**
- `category` (optional): Filter by category
- `status` (optional): Filter by status (available, borrowed, maintenance, retired)
- `search` (optional): Search by name or serial number
- `page` (optional): Page number
- `limit` (optional): Items per page

**Example:**
```
GET /equipment?category=Laptops&status=available&page=1&limit=10
```

**Response:**
```json
{
  "success": true,
  "data": {
    "equipment": [
      {
        "_id": "1",
        "name": "Laptop Dell XPS 13",
        "category": "Laptops",
        "status": "available",
        "serialNumber": "DLL001",
        "description": "High-performance laptop for development",
        "location": "Lab A",
        "createdAt": "2023-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalItems": 1
    }
  }
}
```

### GET /equipment/categories
Get all equipment categories.

**Response:**
```json
{
  "success": true,
  "data": ["Laptops", "Projectors", "Cameras", "Audio Equipment"]
}
```

### GET /equipment/stats
Get equipment statistics (Staff/Admin only).

**Response:**
```json
{
  "success": true,
  "data": {
    "totalEquipment": 15,
    "availableEquipment": 8,
    "borrowedEquipment": 5,
    "maintenanceEquipment": 2,
    "categoryBreakdown": {
      "Laptops": 5,
      "Projectors": 3,
      "Cameras": 4,
      "Audio Equipment": 3
    }
  }
}
```

### GET /equipment/:id
Get specific equipment by ID.

### POST /equipment
Create new equipment (Staff/Admin only).

**Request Body:**
```json
{
  "name": "New Laptop",
  "category": "Laptops",
  "serialNumber": "LAP001",
  "description": "Brand new laptop for students",
  "location": "Lab B"
}
```

### PUT /equipment/:id
Update equipment (Staff/Admin only).

### DELETE /equipment/:id
Delete equipment (Admin only).

---

## Request Endpoints

### GET /requests
Get requests (filtered by user role).

**Query Parameters:**
- `status` (optional): Filter by status
- `equipmentId` (optional): Filter by equipment
- `userId` (optional): Filter by user (Admin/Staff only)
- `page`, `limit`: Pagination

**Response:**
```json
{
  "success": true,
  "data": {
    "requests": [
      {
        "_id": "1",
        "userId": "3",
        "equipmentId": "2",
        "status": "approved",
        "requestDate": "2023-10-01T00:00:00.000Z",
        "approvedDate": "2023-10-02T00:00:00.000Z",
        "purpose": "Class presentation",
        "user": {
          "firstName": "John",
          "lastName": "Student"
        },
        "equipment": {
          "name": "Projector Epson",
          "serialNumber": "EPS001"
        }
      }
    ]
  }
}
```

### GET /requests/stats
Get request statistics (Staff/Admin only).

### GET /requests/:id
Get specific request by ID.

### POST /requests
Create a new equipment request.

**Request Body:**
```json
{
  "equipmentId": "1",
  "purpose": "Research project",
  "expectedReturnDate": "2023-12-15T00:00:00.000Z",
  "notes": "Need for thesis work"
}
```

### PUT /requests/:id/approve
Approve a request (Staff/Admin only).

**Request Body:**
```json
{
  "notes": "Approved for educational use",
  "borrowDate": "2023-10-05T00:00:00.000Z"
}
```

### PUT /requests/:id/reject
Reject a request (Staff/Admin only).

**Request Body:**
```json
{
  "reason": "Equipment not available"
}
```

### PUT /requests/:id/borrowed
Mark request as borrowed (Staff/Admin only).

### PUT /requests/:id/returned
Mark request as returned (Staff/Admin only).

---

## Utility Endpoints

### GET /health
Health check endpoint.

**Response:**
```json
{
  "success": true,
  "message": "School Equipment Portal API is running",
  "timestamp": "2023-10-01T12:00:00.000Z",
  "environment": "development"
}
```

### POST /test
Test endpoint for connectivity.

### GET /docs
Get API documentation summary.

---

## Error Responses

### Validation Error (400)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email",
      "value": "invalid-email"
    }
  ]
}
```

### Authentication Error (401)
```json
{
  "success": false,
  "message": "Authentication required"
}
```

### Authorization Error (403)
```json
{
  "success": false,
  "message": "Insufficient permissions"
}
```

### Not Found Error (404)
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### Server Error (500)
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## Rate Limiting

The API implements rate limiting:
- **Window**: 15 minutes
- **Max Requests**: 100 per IP address
- **Response**: 429 Too Many Requests

---

## CORS Configuration

The API accepts requests from:
- `http://localhost:3000` (Frontend development)
- `http://localhost:3001` (API documentation)

---

## Development Notes

### Mock Database
The current implementation uses an in-memory mock database for development purposes. Data includes:
- Pre-configured test users
- Sample equipment items
- Example requests

### Environment Variables
Key configuration in `.env`:
- `PORT`: Server port (default: 3001)
- `JWT_SECRET`: Secret key for JWT tokens
- `CLIENT_URL`: Frontend URL for CORS
- `NODE_ENV`: Environment mode

### Security Features
- JWT authentication
- Role-based authorization
- Input validation with express-validator
- Rate limiting
- CORS protection
- Security headers with Helmet

---

## Testing the API

You can test the API using:

1. **Browser**: Visit `http://localhost:3001/api/docs`
2. **Postman**: Import the endpoints and test with the provided examples
3. **cURL**: Use command-line requests
4. **Frontend**: The React application provides a complete UI interface

### Example cURL Commands

**Login:**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

**Get Equipment (with auth):**
```bash
curl -X GET http://localhost:3001/api/equipment \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Create Equipment (Staff/Admin):**
```bash
curl -X POST http://localhost:3001/api/equipment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"name":"Test Equipment","category":"Testing","serialNumber":"TEST001"}'
```

---

This documentation covers all available endpoints and provides examples for testing and integration with the School Equipment Portal frontend application.