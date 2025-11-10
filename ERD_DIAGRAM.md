# Entity Relationship Diagram (ERD)
## School Equipment Portal - Visual Database Design

### 🎯 Visual Database Schema

```mermaid
erDiagram
    USER ||--o{ EQUIPMENT : creates
    USER ||--o{ EQUIPMENT : updates
    USER ||--o{ REQUEST : makes
    USER ||--o{ REQUEST : approves
    EQUIPMENT ||--o{ REQUEST : "is requested"

    USER {
        ObjectId _id PK
        string username UK "3-30 chars, alphanumeric"
        string email UK "valid email format"
        string password "hashed, min 6 chars"
        enum role "student|staff|admin"
        string firstName "required, max 50"
        string lastName "required, max 50"
        string studentId "sparse, required for students"
        string department "max 100 chars"
        boolean isActive "default true"
        date lastLogin "timestamp"
        string profilePicture "URL"
        date createdAt "auto-generated"
        date updatedAt "auto-updated"
    }

    EQUIPMENT {
        ObjectId _id PK
        string name "required, max 100"
        string description "max 500"
        enum category "Electronics|Sports|Laboratory|Audio_Visual|Computing|Tools|Other"
        enum condition "Excellent|Good|Fair|Poor|Out_of_Service"
        number totalQuantity "min 0"
        number availableQuantity "min 0, ≤ totalQuantity"
        string serialNumber UK "sparse"
        string brand "max 50"
        string model "max 50"
        date purchaseDate "purchase date"
        number purchasePrice "min 0"
        string location "max 100"
        boolean isActive "default true"
        string imageUrl "URL"
        string notes "max 1000"
        ObjectId createdBy FK
        ObjectId lastUpdatedBy FK
        date createdAt "auto-generated"
        date updatedAt "auto-updated"
    }

    REQUEST {
        ObjectId _id PK
        ObjectId requester FK
        ObjectId equipment FK
        number quantity "min 1"
        date requestDate "default now"
        date requestedStartDate "required"
        date requestedEndDate "required"
        date actualStartDate "nullable"
        date actualEndDate "nullable"
        enum status "pending|approved|rejected|borrowed|returned|overdue"
        string purpose "required, max 500"
        string notes "max 1000"
        ObjectId approvedBy FK
        date approvalDate "nullable"
        string rejectionReason "max 500"
        string returnNotes "max 500"
        boolean damageReported "default false"
        string damageDescription "max 1000"
        number penalty "min 0, default 0"
        date createdAt "auto-generated"
        date updatedAt "auto-updated"
    }
```

### 📊 Database Flow Diagram

```mermaid
flowchart TD
    A[User Registration] --> B{Role Assignment}
    B -->|Student| C[Student Profile]
    B -->|Staff| D[Staff Profile]
    B -->|Admin| E[Admin Profile]
    
    C --> F[Browse Equipment]
    D --> G[Manage Equipment]
    E --> G
    
    F --> H[Create Request]
    H --> I{Request Status}
    
    I -->|Pending| J[Wait for Approval]
    I -->|Approved| K[Equipment Borrowed]
    I -->|Rejected| L[Request Denied]
    
    K --> M[Equipment In Use]
    M --> N[Return Equipment]
    N --> O[Request Completed]
    
    G --> P[Add/Edit Equipment]
    P --> Q[Equipment Available]
    Q --> F
    
    J --> R{Staff/Admin Review}
    R -->|Approve| K
    R -->|Reject| L
```

### 🔄 Request Lifecycle State Diagram

```mermaid
stateDiagram-v2
    [*] --> Pending : User creates request
    
    Pending --> Approved : Staff/Admin approves
    Pending --> Rejected : Staff/Admin rejects
    
    Approved --> Borrowed : Equipment handed out
    Approved --> Expired : Request expires
    
    Borrowed --> Returned : Equipment returned on time
    Borrowed --> Overdue : Past return date
    
    Overdue --> Returned : Equipment returned late
    Overdue --> Lost : Equipment declared lost
    
    Returned --> [*] : Request completed
    Rejected --> [*] : Request closed
    Expired --> [*] : Request closed
    Lost --> [*] : Request closed with penalty
```

### 🏗️ Database Architecture Layers

```mermaid
flowchart TB
    subgraph "Application Layer"
        A1[React Frontend]
        A2[Express.js API]
    end
    
    subgraph "Business Logic Layer"
        B1[Authentication Controller]
        B2[Equipment Controller]
        B3[Request Controller]
        B4[User Management Controller]
    end
    
    subgraph "Data Access Layer"
        C1[Mongoose ODM]
        C2[Validation Middleware]
        C3[Authorization Middleware]
    end
    
    subgraph "Database Layer"
        D1[(MongoDB Atlas)]
        D2[User Collection]
        D3[Equipment Collection]
        D4[Request Collection]
    end
    
    A1 --> A2
    A2 --> B1
    A2 --> B2
    A2 --> B3
    A2 --> B4
    
    B1 --> C1
    B2 --> C1
    B3 --> C1
    B4 --> C1
    
    C1 --> D1
    C2 --> C1
    C3 --> C1
    
    D1 --> D2
    D1 --> D3
    D1 --> D4
```

### 📈 Data Relationships Matrix

| Collection | Relationship Type | Related Collection | Foreign Key | Description |
|------------|------------------|-------------------|-------------|-------------|
| User | One-to-Many | Equipment | createdBy | User creates equipment |
| User | One-to-Many | Equipment | lastUpdatedBy | User updates equipment |
| User | One-to-Many | Request | requester | User makes requests |
| User | One-to-Many | Request | approvedBy | User approves requests |
| Equipment | One-to-Many | Request | equipment | Equipment has requests |

### 🔍 Query Optimization Strategy

```mermaid
flowchart LR
    A[Query Request] --> B{Index Available?}
    B -->|Yes| C[Use Index]
    B -->|No| D[Full Collection Scan]
    
    C --> E[Fast Query]
    D --> F[Slow Query]
    
    E --> G[Return Results]
    F --> G
    
    subgraph "Indexes"
        H[Username Index]
        I[Email Index]
        J[Category Index]
        K[Status Index]
        L[Text Search Index]
    end
    
    C --> H
    C --> I
    C --> J
    C --> K
    C --> L
```

### 📊 Performance Metrics

```mermaid
pie title Database Collection Sizes (Expected)
    "Users" : 100
    "Equipment" : 500
    "Requests" : 2000
    "System Data" : 50
```

### 🔐 Security Architecture

```mermaid
flowchart TD
    A[Client Request] --> B[Authentication Middleware]
    B --> C{Valid JWT?}
    
    C -->|No| D[Return 401 Unauthorized]
    C -->|Yes| E[Authorization Middleware]
    
    E --> F{Role Permission?}
    F -->|No| G[Return 403 Forbidden]
    F -->|Yes| H[Validation Middleware]
    
    H --> I{Valid Input?}
    I -->|No| J[Return 400 Bad Request]
    I -->|Yes| K[Database Operation]
    
    K --> L[Hash Passwords]
    K --> M[Sanitize Data]
    K --> N[Execute Query]
    
    N --> O[Return Response]
```

### 🎓 M.Tech Project Considerations

This database design demonstrates:

1. **Professional Data Modeling**: Industry-standard ERD and relationship design
2. **Scalability**: Proper indexing and query optimization
3. **Security**: Authentication, authorization, and data validation
4. **Real-world Application**: Equipment lending is a common institutional need
5. **Complex Relationships**: Multiple entity relationships with business logic
6. **State Management**: Request lifecycle and status transitions
7. **Performance Optimization**: Strategic index placement and query patterns
8. **Documentation**: Comprehensive schema documentation for academic review

### 📚 Academic Value

- **Database Design Principles**: Normalization, relationships, constraints
- **NoSQL Implementation**: MongoDB best practices
- **Business Logic Modeling**: Real-world workflow representation
- **Performance Engineering**: Index strategy and query optimization
- **Security Architecture**: Multi-layer security implementation
- **System Documentation**: Professional-grade technical documentation