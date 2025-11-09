# 🏫 School Equipment Lending Portal

A comprehensive full-stack web application for managing school equipment loans, built with **React (TypeScript)**, **Node.js/Express**, and **MongoDB**.

## 🎯 Features

### 🔐 Authentication & Authorization
- **Role-based access control** (Student, Staff, Admin)
- **JWT-based authentication**
- User registration and login
- Protected routes based on user roles

### 📦 Equipment Management
- **CRUD operations** for equipment (Admin/Staff)
- **Equipment categorization** (Electronics, Sports, Laboratory, etc.)
- **Inventory tracking** with quantity management
- **Search and filter** functionality
- Equipment condition tracking

### 📋 Request Management
- **Borrowing requests** by students
- **Approval/rejection workflow** (Staff/Admin)
- **Request status tracking** (pending, approved, rejected, borrowed, returned)
- **Borrowing history** and analytics
- **Damage reporting** and penalty system

### 📊 Dashboard & Analytics
- **Role-based dashboards** with relevant information
- **Equipment availability** overview
- **Request statistics** and trends
- **Recent activity** summaries

---

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **React Router** for navigation
- **Axios** for HTTP requests
- **React Context API** for state management
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **React Toastify** for notifications

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Express Validator** for input validation
- **Helmet** for security headers
- **CORS** for cross-origin requests
- **Rate limiting** for API protection

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v16 or higher)
- **MongoDB** (local installation or MongoDB Atlas)
- **npm** or **yarn**

### 1. Clone & Setup
```bash
# Clone the repository
git clone <repository-url>
cd school-equipment-portal

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 2. Environment Configuration

#### Backend (.env)
```bash
# Create server/.env file
cd server
cp .env.example .env
```

Edit `server/.env`:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/school-equipment-portal
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
CLIENT_URL=http://localhost:3000
```

#### Frontend (.env)
```bash
# Create client/.env file
cd client
cp .env.example .env
```

Edit `client/.env`:
```env
REACT_APP_API_BASE_URL=http://localhost:5000/api
REACT_APP_APP_NAME=School Equipment Portal
REACT_APP_VERSION=1.0.0
```

### 3. Database Setup

#### Option A: Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service
3. Database will be created automatically

#### Option B: MongoDB Atlas
1. Create a MongoDB Atlas account
2. Create a new cluster
3. Update `MONGODB_URI` in `server/.env`

### 4. Seed Sample Data
```bash
cd server
npm run seed
```

### 5. Start the Application

#### Start Backend (Terminal 1)
```bash
cd server
npm run dev
```
Backend will run on http://localhost:5000

#### Start Frontend (Terminal 2)
```bash
cd client
npm start
```
Frontend will run on http://localhost:3000

---

## 🔑 Demo Credentials

After seeding the database, use these credentials:

| Role | Username | Password |
|------|----------|----------|
| **Admin** | admin | password123 |
| **Staff** | staff | password123 |
| **Student** | student | password123 |

---

## 📁 Project Structure

```
school-equipment-portal/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── api/           # API service functions
│   │   ├── components/    # Reusable components
│   │   ├── context/       # React Context (Auth)
│   │   ├── pages/         # Route components
│   │   └── App.tsx        # Main App component
│   ├── public/
│   └── package.json
│
├── server/                # Node.js Backend
│   ├── config/           # Database configuration
│   ├── controllers/      # Business logic
│   ├── middleware/       # Custom middleware
│   ├── models/           # Mongoose schemas
│   ├── routes/           # Express routes
│   ├── scripts/          # Utility scripts
│   ├── index.js          # Server entry point
│   └── package.json
│
└── README.md
```

---

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `GET /api/auth/users` - Get all users (Admin only)

### Equipment
- `GET /api/equipment` - Get all equipment (with filters)
- `GET /api/equipment/:id` - Get equipment by ID
- `POST /api/equipment` - Create equipment (Staff/Admin)
- `PUT /api/equipment/:id` - Update equipment (Staff/Admin)
- `DELETE /api/equipment/:id` - Delete equipment (Admin)
- `GET /api/equipment/categories` - Get categories
- `GET /api/equipment/stats` - Get statistics (Staff/Admin)

### Requests
- `GET /api/requests` - Get requests (role-filtered)
- `GET /api/requests/:id` - Get request by ID
- `POST /api/requests` - Create new request
- `PUT /api/requests/:id/approve` - Approve request (Staff/Admin)
- `PUT /api/requests/:id/reject` - Reject request (Staff/Admin)
- `PUT /api/requests/:id/borrowed` - Mark as borrowed (Staff/Admin)
- `PUT /api/requests/:id/returned` - Mark as returned (Staff/Admin)
- `GET /api/requests/stats` - Get statistics (Staff/Admin)

---

## 👥 User Roles & Permissions

### 🎓 Student
- View available equipment
- Create borrowing requests
- View own request history
- Update profile information

### 👨‍🏫 Staff
- All student permissions
- Approve/reject requests
- Add/edit equipment
- View all requests
- Mark items as borrowed/returned

### 👨‍💼 Admin
- All staff permissions
- Delete equipment
- Manage users
- View system analytics
- Full system access

---

## 🔧 Development

### Available Scripts

#### Backend
```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm run seed       # Seed database with sample data
npm test          # Run tests
```

#### Frontend
```bash
npm start         # Start development server
npm run build     # Build for production
npm test          # Run tests
npm run eject     # Eject from Create React App
```

### Adding New Features

1. **Backend**: Add routes → controllers → models
2. **Frontend**: Add API functions → pages/components → routing
3. **Database**: Update models and run migrations if needed

---

## 🚀 Deployment

### Backend Deployment (Heroku/Railway/DigitalOcean)
1. Set environment variables
2. Configure MongoDB Atlas
3. Deploy using platform-specific instructions

### Frontend Deployment (Netlify/Vercel)
1. Build the React app: `npm run build`
2. Deploy the `build` folder
3. Configure environment variables

---

## 🧪 Testing

### Manual Testing Checklist
- [ ] User registration and login
- [ ] Role-based access control
- [ ] Equipment CRUD operations
- [ ] Request workflow (create → approve → borrow → return)
- [ ] Search and filtering
- [ ] Dashboard statistics

### Test Data
Use the seeded data for comprehensive testing across all user roles.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -m 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

---

## 📝 API Documentation

Visit `http://localhost:5000/api/docs` when the server is running for interactive API documentation.

---

## 🔒 Security Features

- **JWT Authentication** with secure token handling
- **Password hashing** with bcrypt
- **Input validation** on all endpoints
- **Rate limiting** to prevent abuse
- **CORS protection**
- **Security headers** with Helmet
- **Role-based authorization**

---

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in `.env`
   - Verify network access for Atlas

2. **CORS Errors**
   - Check `CLIENT_URL` in server `.env`
   - Verify API base URL in client `.env`

3. **Authentication Issues**
   - Clear browser localStorage
   - Check JWT secret configuration
   - Verify user exists in database

4. **Build Errors**
   - Delete `node_modules` and reinstall
   - Check for TypeScript errors
   - Verify all dependencies are installed

---

## 📧 Support

For questions or issues:
- Create an issue in the repository
- Check the troubleshooting section
- Review the API documentation

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🎉 Acknowledgments

- **React** team for the amazing framework
- **Express.js** for the robust backend framework
- **MongoDB** for the flexible database
- **Tailwind CSS** for the utility-first styling
- School administration for requirements and feedback

---

**Built with ❤️ for educational institutions**