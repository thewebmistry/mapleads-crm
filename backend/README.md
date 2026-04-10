# MapLeads CRM - Backend Core

Production-ready Express.js backend with MongoDB, modular architecture, and comprehensive API.

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   - Copy `.env.example` to `.env` (if exists) or use the provided `.env`
   - Update `MONGODB_URI` for your MongoDB instance

3. **Start the server:**
   ```bash
   # Development (with hot reload)
   npm run dev:backend
   
   # Production
   npm start
   ```

## 📁 Project Structure

```
backend/
├── server.js              # Main Express server entry point
├── config/
│   └── db.js             # MongoDB connection & configuration
├── routes/               # API route modules
│   ├── health.routes.js  # Health check endpoints
│   └── leads.routes.js   # Leads CRUD operations
├── controllers/          # Business logic (future)
├── models/              # Mongoose schemas (future)
└── middleware/          # Custom middleware (future)
```

## 🔧 Configuration

### Environment Variables
See `.env` file for all available options:

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment mode | `development` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/mapleads-crm` |
| `JWT_SECRET` | JWT signing secret | `your-super-secret-jwt-key` |
| `APP_NAME` | Application name | `MapLeads CRM` |
| `API_VERSION` | API version prefix | `v1` |

### Database Connection
The `backend/config/db.js` provides:
- Automatic connection with error handling
- Connection status monitoring
- Graceful shutdown support
- Health check integration

## 🌐 API Endpoints

### Health Checks
- `GET /api/health` - Basic health status
- `GET /api/health/detailed` - Detailed system info
- `GET /api/health/readiness` - Readiness probe (K8s)
- `GET /api/health/liveness` - Liveness probe (K8s)

### Leads API (`/api/v1/leads`)
- `GET /` - List all leads
- `GET /:id` - Get single lead
- `POST /` - Create new lead
- `PUT /:id` - Update lead
- `DELETE /:id` - Delete lead
- `GET /stats/summary` - Lead statistics

### API Root
- `GET /api/v1` - API documentation and endpoints

## 🛡️ Security & Middleware

- **Helmet.js**: Security headers
- **CORS**: Configurable cross-origin requests
- **Morgan**: HTTP request logging
- **Body Parsers**: JSON and URL-encoded data
- **Error Handling**: Global error middleware
- **404 Handler**: Custom not-found responses

## 📊 Health Check Response

```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "service": "MapLeads CRM",
  "version": "1.0.0",
  "environment": "development",
  "uptime": 123.45,
  "database": {
    "status": "connected",
    "host": "localhost:27017",
    "name": "mapleads-crm"
  }
}
```

## 🧪 Testing

Run the server in development:
```bash
npm run dev:backend
```

The server will start on `http://localhost:5000` with:
- Auto-restart on file changes (nodemon)
- Detailed request logging
- Development CORS settings

## 🔄 Modular Architecture

### Adding New Routes
1. Create route file in `backend/routes/`
2. Export Express Router with endpoints
3. Import in `server.js`
4. Mount with `app.use('/api/path', routeModule)`

Example:
```javascript
// server.js
const newRoutes = require('./routes/new.routes');
app.use(`/api/${API_VERSION}/new`, newRoutes);
```

### Database Models
Future models should be placed in `backend/models/` using Mongoose schemas.

### Controllers
Business logic should be separated into `backend/controllers/` for clean separation of concerns.

## 🚨 Error Handling

The backend includes comprehensive error handling:

1. **Validation Errors**: 400 Bad Request
2. **Authentication Errors**: 401 Unauthorized  
3. **Authorization Errors**: 403 Forbidden
4. **Not Found**: 404 Not Found
5. **Server Errors**: 500 Internal Server Error

All errors return consistent JSON format:
```json
{
  "success": false,
  "error": "Error message",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## 📈 Monitoring

- Database connection status in health checks
- Process memory usage tracking
- Uptime monitoring
- Request/response logging

## 🐳 Docker & Deployment

Ready for containerization with:
- Graceful shutdown handling
- Readiness/liveness probes
- Environment-based configuration
- Stateless design

## 🔗 Dependencies

See `package.json` for complete list:
- **express**: Web framework
- **mongoose**: MongoDB ODM
- **cors**: Cross-origin resource sharing
- **helmet**: Security headers
- **dotenv**: Environment variables
- **morgan**: HTTP request logger
- **bcryptjs**: Password hashing
- **jsonwebtoken**: Authentication

## 📝 License

Proprietary - MapLeads CRM