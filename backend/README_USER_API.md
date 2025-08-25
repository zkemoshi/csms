# User API Documentation

This document describes the user authentication and management API endpoints.

## Base URL
```
http://localhost:8080/api/users
```

## Authentication
The API uses JWT tokens for authentication. Tokens are automatically set as HTTP-only cookies upon login/register, or can be sent via Authorization header:
```
Authorization: Bearer <token>
```

## Endpoints

### Public Endpoints

#### Register User
- **POST** `/register`
- **Description**: Create a new user account
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "role": "user" // optional, defaults to "user"
  }
  ```
- **Response**:
  ```json
  {
    "_id": "user_id",
    "email": "user@example.com",
    "role": "user",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
  ```

#### Login User
- **POST** `/login`
- **Description**: Authenticate user and get JWT token
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response**:
  ```json
  {
    "_id": "user_id",
    "email": "user@example.com",
    "role": "user",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
  ```

### Protected Endpoints (Require Authentication)

#### Logout User
- **POST** `/logout`
- **Description**: Logout user and clear JWT token
- **Headers**: JWT token required
- **Response**:
  ```json
  {
    "message": "Logged out successfully"
  }
  ```

#### Get User Profile
- **GET** `/profile`
- **Description**: Get current user's profile information
- **Headers**: JWT token required
- **Response**:
  ```json
  {
    "_id": "user_id",
    "email": "user@example.com",
    "role": "user",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
  ```

#### Update User Profile
- **PUT** `/profile`
- **Description**: Update current user's profile information
- **Headers**: JWT token required
- **Body**:
  ```json
  {
    "email": "newemail@example.com",
    "password": "newpassword123"
  }
  ```
- **Response**:
  ```json
  {
    "_id": "user_id",
    "email": "newemail@example.com",
    "role": "user",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
  ```

### Admin Endpoints (Require Admin Role)

#### Get All Users
- **GET** `/`
- **Description**: Get all users (admin only)
- **Headers**: JWT token with admin role required
- **Response**:
  ```json
  [
    {
      "_id": "user_id_1",
      "email": "user1@example.com",
      "role": "user",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    {
      "_id": "user_id_2",
      "email": "admin@example.com",
      "role": "admin",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
  ```

#### Get User by ID
- **GET** `/:id`
- **Description**: Get specific user by ID (admin only)
- **Headers**: JWT token with admin role required
- **Response**:
  ```json
  {
    "_id": "user_id",
    "email": "user@example.com",
    "role": "user",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
  ```

#### Delete User
- **DELETE** `/:id`
- **Description**: Delete specific user (admin only)
- **Headers**: JWT token with admin role required
- **Response**:
  ```json
  {
    "message": "User removed successfully"
  }
  ```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "Error message description"
}
```

Common HTTP status codes:
- `400` - Bad Request (validation errors, duplicate email, etc.)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (user not found)
- `500` - Server Error

## Environment Variables

Make sure to set the following environment variables:
- `JWT_SECRET` - Secret key for JWT token signing
- `MONGO_URI` - MongoDB connection string
- `NODE_ENV` - Environment (development/production)

## Security Features

- Passwords are hashed using bcrypt
- JWT tokens are HTTP-only cookies
- Role-based access control
- Input validation and sanitization
- Comprehensive error handling
