# CSMS API Documentation

This document describes all the API endpoints for the Charging Station Management System (CSMS).

## Base URL
```
http://localhost:8080/api
```

## Authentication
The API uses JWT tokens for authentication. Tokens are automatically set as HTTP-only cookies upon login/register, or can be sent via Authorization header:
```
Authorization: Bearer <token>
```

---

## 🔐 User Management API

### Base: `/users`

#### Public Endpoints
- **POST** `/register` - Register new user
- **POST** `/login` - Login user

#### Protected Endpoints
- **POST** `/logout` - Logout user
- **GET** `/profile` - Get user profile
- **PUT** `/profile` - Update user profile

#### Admin Endpoints
- **GET** `/` - Get all users
- **GET** `/:id` - Get user by ID
- **DELETE** `/:id` - Delete user

---

## 🔌 Station Management API

### Base: `/stations`

#### Protected Endpoints
- **GET** `/` - Get all stations (with pagination)
- **GET** `/stats` - Get station statistics
- **GET** `/online` - Get online stations
- **GET** `/offline` - Get offline stations
- **GET** `/available` - Get available stations
- **GET** `/charging` - Get charging stations
- **GET** `/station/:stationId` - Get station by station ID
- **GET** `/:id` - Get station by ID
- **POST** `/` - Create new station
- **PUT** `/:id` - Update station
- **PUT** `/:id/status` - Update station status
- **PUT** `/:id/heartbeat` - Update station heartbeat

#### Admin Endpoints
- **PUT** `/bulk-status` - Bulk update station statuses
- **DELETE** `/:id` - Delete station

### Station Status Values
- `Available` - Ready for charging
- `Preparing` - Preparing for charging
- `Charging` - Currently charging
- `SuspendedEV` - Suspended by EV
- `SuspendedEVSE` - Suspended by station
- `Finishing` - Finishing charging
- `Reserved` - Reserved
- `Unavailable` - Unavailable
- `Faulted` - Faulted
- `Offline` - Offline

---

## ⚡ Transaction Management API

### Base: `/transactions`

#### Protected Endpoints
- **GET** `/` - Get all transactions (with filtering & pagination)
- **GET** `/stats` - Get transaction statistics
- **GET** `/active` - Get active transactions
- **GET** `/station/:stationId` - Get transactions by station
- **GET** `/transaction/:transactionId` - Get transaction by transaction ID
- **GET** `/:id` - Get transaction by ID
- **POST** `/` - Create new transaction
- **POST** `/:id/meter-values` - Add meter values to transaction
- **PUT** `/:id` - Update transaction
- **PUT** `/:id/stop` - Stop transaction

#### Admin Endpoints
- **DELETE** `/:id` - Delete transaction

### Transaction Status Values
- `Active` - Transaction is active
- `Stopped` - Transaction has stopped

### Query Parameters for Transactions
- `stationId` - Filter by station ID
- `status` - Filter by status
- `startDate` - Filter by start date (ISO string)
- `endDate` - Filter by end date (ISO string)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)

---

## 🔋 Session Management API

### Base: `/sessions`

#### Protected Endpoints
- **GET** `/` - Get all sessions (with filtering & pagination)
- **GET** `/stats` - Get session statistics
- **GET** `/active` - Get active sessions
- **GET** `/completed` - Get completed sessions
- **GET** `/pending-ocpi` - Get sessions pending OCPI sync
- **GET** `/date-range` - Get sessions by date range
- **GET** `/station/:stationId` - Get sessions by station
- **GET** `/user/:idTag` - Get sessions by user (idTag)
- **GET** `/session/:sessionId` - Get session by session ID
- **GET** `/:id` - Get session by ID
- **POST** `/` - Create new session
- **PUT** `/:id` - Update session
- **PUT** `/:id/complete` - Complete session
- **PUT** `/:id/ocpi-sent` - Mark session as OCPI sent

#### Admin Endpoints
- **DELETE** `/:id` - Delete session

### Session Status Values
- `IN_PROGRESS` - Session is in progress
- `COMPLETED` - Session is completed

### Query Parameters for Sessions
- `stationId` - Filter by station ID
- `status` - Filter by status
- `startDate` - Filter by start date (ISO string)
- `endDate` - Filter by end date (ISO string)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)

---

## 🎫 Token Management API

### Base: `/tokens`

#### Protected Endpoints
- **GET** `/:idTag` - Get token by ID tag
- **POST** `/` - Create new token
- **PUT** `/:idTag` - Update token
- **DELETE** `/:idTag` - Delete token
- **POST** `/:idTag/activate` - Activate token
- **POST** `/:idTag/block` - Block token

---

## 📊 Response Formats

### Success Response
```json
{
  "data": "response data",
  "message": "success message"
}
```

### Paginated Response
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

### Error Response
```json
{
  "error": "Error message description"
}
```

---

## 🔧 Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

---

## 📝 Example Requests

### Register User
```bash
curl -X POST http://localhost:8080/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

### Create Station
```bash
curl -X POST http://localhost:8080/api/stations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"stationId":"STATION001","chargePointVendor":"Tesla","chargePointModel":"Supercharger"}'
```

### Get Transactions with Filtering
```bash
curl -X GET "http://localhost:8080/api/transactions?stationId=STATION001&status=Active&page=1&limit=10" \
  -H "Authorization: Bearer <token>"
```

### Complete Session
```bash
curl -X PUT http://localhost:8080/api/sessions/123/complete \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"stopTime":"2024-01-01T12:00:00Z","energyWh":5000,"socEnd":80}'
```

---

## 🔒 Security Features

- JWT token authentication
- Role-based access control (user/admin)
- HTTP-only cookies for token storage
- Input validation and sanitization
- Comprehensive error handling
- Password hashing with bcrypt

---

## 🌍 Environment Variables

Required environment variables:
- `JWT_SECRET` - Secret key for JWT token signing
- `MONGO_URI` - MongoDB connection string
- `NODE_ENV` - Environment (development/production)

---

## 🚀 Getting Started

1. Install dependencies: `npm install`
2. Set up environment variables in `.env` file
3. Start the server: `npm run server`
4. Access the API at `http://localhost:8080/api`

The API is now ready for charging station management! 🎯
