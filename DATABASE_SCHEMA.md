# Database Schema and Model Diagrams
## School Equipment Portal - M.Tech Project

### Overview
This document provides detailed database schema, entity-relationship diagrams, and model specifications for the School Equipment Portal application built with MongoDB and Mongoose ODM.

---

## 🗄️ Database Architecture

### Technology Stack
- **Database**: MongoDB Atlas (Cloud)
- **ODM**: Mongoose
- **Environment**: Node.js
- **Authentication**: JWT

### Database Name
`school-equipment-portal`

---

## 📊 Entity Relationship Diagram (ERD)

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│      User       │         │    Equipment    │         │     Request     │
├─────────────────┤         ├─────────────────┤         ├─────────────────┤
│ _id (ObjectId)  │◄────────┤ createdBy       │         │ _id (ObjectId)  │
│ username        │         │ lastUpdatedBy   │         │ requester       │◄──┐
│ email           │         ├─────────────────┤         │ equipment       │   │
│ password        │         │ _id (ObjectId)  │◄────────┤ quantity        │   │
│ role            │         │ name            │         │ status          │   │
│ firstName       │         │ description     │         │ requestDate     │   │
│ lastName        │         │ category        │         │ purpose         │   │
│ studentId       │         │ condition       │         │ approvedBy      │───┘
│ department      │         │ totalQuantity   │         │ approvalDate    │
│ isActive        │         │ availableQty    │         │ actualStartDate │
│ createdAt       │         │ serialNumber    │         │ actualEndDate   │
│ updatedAt       │         │ brand           │         │ createdAt       │
└─────────────────┘         │ model           │         │ updatedAt       │
                            │ purchaseDate    │         └─────────────────┘
                            │ purchasePrice   │
                            │ location        │
                            │ isActive        │
                            │ createdAt       │
                            │ updatedAt       │
                            └─────────────────┘
```

### Relationships
- **User → Equipment**: One-to-Many (createdBy, lastUpdatedBy)
- **User → Request**: One-to-Many (requester, approvedBy)
- **Equipment → Request**: One-to-Many (equipment)

---

## 📋 Detailed Schema Specifications

### 1. User Collection

```javascript
{
  _id: ObjectId,                    // Primary Key
  username: String,                 // Unique, 3-30 chars
  email: String,                    // Unique, validated email
  password: String,                 // Hashed, min 6 chars
  role: String,                     // Enum: ['student', 'staff', 'admin']
  firstName: String,                // Required, max 50 chars
  lastName: String,                 // Required, max 50 chars
  studentId: String,                // Sparse index, required for students
  department: String,               // Max 100 chars
  isActive: Boolean,                // Default: true
  lastLogin: Date,                  // Timestamp of last login
  profilePicture: String,           // URL to profile image
  createdAt: Date,                  // Auto-generated
  updatedAt: Date                   // Auto-updated
}
```

**Indexes:**
- `username`: Unique index
- `email`: Unique index
- `role`: Regular index
- `isActive`: Regular index
- `createdAt`: Descending index

**Validation Rules:**
- Username: 3-30 characters, alphanumeric + underscore/hyphen
- Email: Valid email format
- Password: Minimum 6 characters (hashed with bcrypt)
- StudentId: Required for role='student'

### 2. Equipment Collection

```javascript
{
  _id: ObjectId,                    // Primary Key
  name: String,                     // Required, max 100 chars
  description: String,              // Max 500 chars
  category: String,                 // Enum: predefined categories
  condition: String,                // Enum: ['Excellent', 'Good', 'Fair', 'Poor', 'Out of Service']
  totalQuantity: Number,            // Required, min 0
  availableQuantity: Number,        // Required, min 0, ≤ totalQuantity
  serialNumber: String,             // Unique, sparse
  brand: String,                    // Max 50 chars
  model: String,                    // Max 50 chars
  purchaseDate: Date,               // Purchase date
  purchasePrice: Number,            // Min 0
  location: String,                 // Max 100 chars
  isActive: Boolean,                // Default: true
  imageUrl: String,                 // URL to equipment image
  notes: String,                    // Max 1000 chars
  createdBy: ObjectId,              // Reference to User
  lastUpdatedBy: ObjectId,          // Reference to User
  createdAt: Date,                  // Auto-generated
  updatedAt: Date                   // Auto-updated
}
```

**Indexes:**
- `name, description, category`: Text index for search
- `category`: Regular index
- `isActive`: Regular index
- `serialNumber`: Unique sparse index

**Categories:**
- Electronics
- Sports
- Laboratory
- Audio/Visual
- Computing
- Tools
- Other

### 3. Request Collection

```javascript
{
  _id: ObjectId,                    // Primary Key
  requester: ObjectId,              // Reference to User (who made request)
  equipment: ObjectId,              // Reference to Equipment
  quantity: Number,                 // Required, min 1
  requestDate: Date,                // Default: now
  requestedStartDate: Date,         // Required, when user wants to start
  requestedEndDate: Date,           // Required, when user wants to return
  actualStartDate: Date,            // When equipment was actually borrowed
  actualEndDate: Date,              // When equipment was actually returned
  status: String,                   // Enum: ['pending', 'approved', 'rejected', 'borrowed', 'returned', 'overdue']
  purpose: String,                  // Required, max 500 chars
  notes: String,                    // Max 1000 chars
  approvedBy: ObjectId,             // Reference to User (staff/admin who approved)
  approvalDate: Date,               // When request was approved
  rejectionReason: String,          // Max 500 chars
  returnNotes: String,              // Max 500 chars
  damageReported: Boolean,          // Default: false
  damageDescription: String,        // Max 1000 chars
  penalty: Number,                  // Min 0, default 0
  createdAt: Date,                  // Auto-generated
  updatedAt: Date                   // Auto-updated
}
```

**Indexes:**
- `requester, status`: Compound index
- `equipment, status`: Compound index
- `requestedStartDate, requestedEndDate`: Compound index
- `status`: Regular index

**Status Flow:**
```
pending → approved → borrowed → returned
    ↓         ↓
 rejected   overdue
```

---

## 🔗 Database Relationships Detail

### User Relationships
```javascript
// User can create multiple equipment
User (createdBy) ←──── Equipment (1:M)

// User can update multiple equipment
User (lastUpdatedBy) ←──── Equipment (1:M)

// User can make multiple requests
User (requester) ←──── Request (1:M)

// User can approve multiple requests (staff/admin only)
User (approvedBy) ←──── Request (1:M)
```

### Equipment Relationships
```javascript
// Equipment can have multiple requests
Equipment ←──── Request (1:M)

// Equipment is created/updated by users
Equipment (createdBy) ────→ User
Equipment (lastUpdatedBy) ────→ User
```

### Request Relationships
```javascript
// Request belongs to one user (requester)
Request (requester) ────→ User

// Request is for one equipment
Request (equipment) ────→ Equipment

// Request is approved by one user (staff/admin)
Request (approvedBy) ────→ User
```

---

## 📈 Database Statistics & Analytics

### User Analytics
```javascript
// User statistics aggregation
db.users.aggregate([
  {
    $group: {
      _id: "$role",
      count: { $sum: 1 },
      active: { $sum: { $cond: ["$isActive", 1, 0] } }
    }
  }
])
```

### Equipment Analytics
```javascript
// Equipment availability statistics
db.equipment.aggregate([
  {
    $group: {
      _id: "$category",
      totalItems: { $sum: "$totalQuantity" },
      availableItems: { $sum: "$availableQuantity" },
      borrowedItems: { $sum: { $subtract: ["$totalQuantity", "$availableQuantity"] } }
    }
  }
])
```

### Request Analytics
```javascript
// Request status distribution
db.requests.aggregate([
  {
    $group: {
      _id: "$status",
      count: { $sum: 1 }
    }
  },
  {
    $sort: { count: -1 }
  }
])
```

---

## 🔒 Security & Data Integrity

### Password Security
- **Hashing**: bcrypt with salt rounds = 12
- **Storage**: Never store plain text passwords
- **Validation**: Minimum 6 characters

### Data Validation
- **Mongoose Validators**: Built-in validation
- **Custom Validators**: Business logic validation
- **Express Validator**: API input validation

### Indexes for Performance
```javascript
// User collection indexes
db.users.createIndex({ username: 1 }, { unique: true })
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ role: 1 })
db.users.createIndex({ isActive: 1 })

// Equipment collection indexes
db.equipment.createIndex({ 
  name: "text", 
  description: "text", 
  category: "text" 
})
db.equipment.createIndex({ category: 1 })
db.equipment.createIndex({ isActive: 1 })

// Request collection indexes
db.requests.createIndex({ requester: 1, status: 1 })
db.requests.createIndex({ equipment: 1, status: 1 })
db.requests.createIndex({ 
  requestedStartDate: 1, 
  requestedEndDate: 1 
})
```

---

## 📊 Sample Data Structure

### Sample User Document
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "username": "student1",
  "email": "student1@school.com",
  "password": "$2a$12$encrypted_password_hash",
  "role": "student",
  "firstName": "Rahul",
  "lastName": "Sharma",
  "studentId": "MT2023001",
  "department": "Computer Science",
  "isActive": true,
  "lastLogin": "2023-11-09T10:30:00.000Z",
  "createdAt": "2023-01-03T00:00:00.000Z",
  "updatedAt": "2023-11-09T10:30:00.000Z"
}
```

### Sample Equipment Document
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "name": "Dell XPS 15 Laptop",
  "description": "High-performance laptop with Intel i7, 16GB RAM, RTX 3050",
  "category": "Computing",
  "condition": "Excellent",
  "totalQuantity": 5,
  "availableQuantity": 3,
  "serialNumber": "DELL001",
  "brand": "Dell",
  "model": "XPS 15 9520",
  "purchaseDate": "2023-01-15T00:00:00.000Z",
  "purchasePrice": 1500,
  "location": "Computer Lab A",
  "isActive": true,
  "createdBy": "507f1f77bcf86cd799439010",
  "lastUpdatedBy": "507f1f77bcf86cd799439010",
  "createdAt": "2023-01-15T00:00:00.000Z",
  "updatedAt": "2023-01-15T00:00:00.000Z"
}
```

### Sample Request Document
```json
{
  "_id": "507f1f77bcf86cd799439013",
  "requester": "507f1f77bcf86cd799439011",
  "equipment": "507f1f77bcf86cd799439012",
  "quantity": 1,
  "requestDate": "2023-11-08T00:00:00.000Z",
  "requestedStartDate": "2023-11-10T00:00:00.000Z",
  "requestedEndDate": "2023-11-20T00:00:00.000Z",
  "actualStartDate": null,
  "actualEndDate": null,
  "status": "approved",
  "purpose": "M.Tech thesis research - Machine Learning project implementation",
  "notes": "Need for deep learning model training",
  "approvedBy": "507f1f77bcf86cd799439014",
  "approvalDate": "2023-11-08T14:30:00.000Z",
  "rejectionReason": null,
  "damageReported": false,
  "penalty": 0,
  "createdAt": "2023-11-08T00:00:00.000Z",
  "updatedAt": "2023-11-08T14:30:00.000Z"
}
```

---

## 🔧 Database Maintenance

### Regular Maintenance Tasks
1. **Index Optimization**: Monitor and optimize query performance
2. **Data Archival**: Archive old requests (older than 1 year)
3. **Backup Strategy**: Daily automated backups
4. **User Cleanup**: Deactivate inactive users
5. **Equipment Audit**: Regular equipment condition updates

### Performance Monitoring
- Query performance analysis
- Index usage statistics
- Database size monitoring
- Connection pool optimization

---

## 📚 Database Design Principles Applied

### 1. Normalization
- Separated concerns into distinct collections
- Eliminated data redundancy
- Maintained referential integrity

### 2. Denormalization (Where Appropriate)
- Embedded user names in populated queries for display
- Status enums for faster queries
- Calculated fields for analytics

### 3. Scalability Considerations
- Proper indexing strategy
- Efficient query patterns
- Pagination support
- Aggregation pipelines for analytics

### 4. Security Best Practices
- Password hashing
- Input validation
- Role-based access control
- Sensitive data protection

---

This database schema is designed to support a comprehensive M.Tech project demonstration with professional-grade data modeling, relationships, and performance optimization.