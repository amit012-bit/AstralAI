# AstralAI

**Astral + AI — starry, visionary AI hub**

A comprehensive full-stack AI solutions marketplace platform built with MERN stack + Next.js, featuring intelligent matching, role-based access control, and modern UI/UX.

## 🚀 Features

### Core Functionality
- **AI-Powered Solution Matching**: Intelligent algorithm matches customer requirements with vendor solutions
- **Multi-Role Platform**: Separate interfaces for customers, vendors, and superadmin
- **Real-time Search & Filtering**: Advanced search with category, industry, and pricing filters
- **Query System**: Customers can post requirements and get matched with relevant solutions
- **Review & Rating System**: Comprehensive review system with detailed ratings
- **Blog & Newsletter**: Content management for latest AI trends and insights

### User Roles
- **Customers**: Find and evaluate AI solutions for their business needs
- **Vendors**: List and manage AI solutions, respond to customer queries
- **Superadmin**: Platform management, user verification, content moderation

### Technical Features
- **Cloud Database**: MongoDB Atlas for global access and real-time sync
- **Authentication**: JWT-based authentication with role-based authorization
- **Responsive Design**: Mobile-first design with dark theme
- **Advanced Search**: Multi-criteria filtering and search functionality
- **Real-time Updates**: Live data synchronization across all users

## 🛠️ Tech Stack

### Frontend
- **Next.js 13+** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **React Query** - Data fetching and caching
- **Axios** - HTTP client for API calls

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB Atlas** - Cloud database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **Bcrypt** - Password hashing
- **Express Validator** - Input validation

## 📦 Installation & Setup

### Prerequisites
- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **MongoDB Atlas account** (cloud database) - [Sign up here](https://www.mongodb.com/atlas)
- **npm** or **yarn** package manager
- **Git** for version control

### Database Setup
This project uses MongoDB Atlas (cloud database) for easy deployment and collaboration.

**Quick Setup:**
1. Create a free MongoDB Atlas account at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a new cluster (choose the free tier)
3. Create a database user with read/write permissions
4. Whitelist your IP address (or use 0.0.0.0/0 for development)
5. Get your connection string from "Connect" → "Connect your application"
6. Create a `.env` file in the `backend/` directory with your MongoDB URI

### Environment Variables
Create a `.env` file in the `backend/` directory:
```env
# MongoDB Atlas Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ai_solutions_marketplace?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production
JWT_EXPIRE=7d

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Configuration
FRONTEND_URL=http://localhost:3000

# OpenAI Configuration (Optional - for AI Agent features)
OPENAI_API_KEY=your_openai_api_key_here
```

**Important Notes:**
- Replace `username` and `password` with your MongoDB Atlas credentials
- Generate a strong JWT secret for production
- The OpenAI API key is optional but required for AI Agent chat features

### Installation Steps

1. **Clone the repository**
```bash
git clone https://github.com/amit012-bit/AstralAI.git
cd AstralAI
```

2. **Install Backend Dependencies**
```bash
cd backend
npm install
```

3. **Install Frontend Dependencies**
```bash
cd ../frontend
npm install
```

4. **Setup Environment Variables**
Create the `.env` file in the `backend/` directory with your MongoDB Atlas credentials.

5. **Seed the Database**
```bash
cd backend
node scripts/create-superadmin.js
node scripts/seed-data.js
```

6. **Start the Application**

**Option 1: Using separate terminals (Recommended)**
```bash
# Terminal 1 - Start Backend
cd backend
npm start

# Terminal 2 - Start Frontend  
cd frontend
npm run dev
```

**Option 2: Using npm scripts (if available)**
```bash
# From root directory
npm run dev:backend  # Starts backend on port 5000
npm run dev:frontend # Starts frontend on port 3000
```

**Access the Application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Documentation: http://localhost:5000/api
- Health Check: http://localhost:5000/health

## 🔑 Default Login Credentials

After seeding the database, you can use these credentials:

- **SuperAdmin**: `SuperAdmin@medicodio.com` / `SuperAdmin@#123`
- **Vendor 1**: `john@techbot.ai` / `password123`
- **Vendor 2**: `sarah@dataflow.ai` / `password123`
- **Customer 1**: `emily.davis@company.com` / `password123`
- **Customer 2**: `david.wilson@retail.com` / `password123`

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Solutions
- `GET /api/solutions` - Get all solutions
- `POST /api/solutions` - Create new solution
- `GET /api/solutions/:id` - Get solution by ID
- `PUT /api/solutions/:id` - Update solution
- `DELETE /api/solutions/:id` - Delete solution

### Queries
- `GET /api/queries` - Get all queries
- `POST /api/queries` - Create new query
- `GET /api/queries/:id` - Get query by ID

## 🏗️ Project Structure

```
AstralAI/
├── backend/                 # Node.js/Express API
│   ├── config/             # Database configuration
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Authentication & validation
│   ├── models/            # MongoDB schemas
│   ├── routes/            # API routes
│   ├── scripts/           # Database seeding scripts
│   ├── services/          # Business logic services
│   └── server.js          # Main server file
├── frontend/               # Next.js React application
│   ├── src/
│   │   ├── components/    # Reusable React components
│   │   ├── contexts/      # React contexts
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # API utilities
│   │   ├── pages/         # Next.js pages
│   │   └── styles/        # Global styles
│   └── public/            # Static assets
├── docker-compose.yml     # Docker configuration
└── README.md             # This file
```

## 🚀 Deployment

### Backend Deployment
1. Deploy to platforms like Heroku, Railway, or DigitalOcean
2. Set environment variables in your hosting platform
3. Ensure MongoDB Atlas connection is configured

### Frontend Deployment
1. Deploy to Vercel, Netlify, or similar platforms
2. Configure environment variables for API endpoints
3. Update CORS settings in backend

## 🔧 Troubleshooting

### Common Issues

**1. MongoDB Connection Error**
```
Error: connect ECONNREFUSED
```
- Ensure MongoDB Atlas cluster is running
- Check your IP address is whitelisted
- Verify connection string format

**2. Port Already in Use**
```
Error: listen EADDRINUSE :::5000
```
- Kill the process: `lsof -i :5000` then `kill -9 <PID>`
- Or change the port in your `.env` file

**3. Module Not Found Errors**
```
Module not found: Can't resolve '@react-three/fiber'
```
- Run `npm install` in both frontend and backend directories
- Clear node_modules and reinstall if needed

**4. Authentication Issues**
- Ensure JWT_SECRET is set in your `.env` file
- Check that user credentials are correct
- Verify database seeding was successful

### Getting Help
- Check the console logs for detailed error messages
- Ensure all environment variables are properly set
- Verify that MongoDB Atlas is accessible from your IP

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with modern web technologies
- Designed for scalability and performance
- Cloud-first architecture for global access
- Open source and community-driven

---

**AstralAI** - Connecting businesses with cutting-edge AI solutions 🚀✨
