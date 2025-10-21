# Authentication API

## Overview
This authentication system uses JWT-based access and refresh tokens with database validation. Old tokens are automatically invalidated when new ones are generated.

## Environment Variables
Make sure to set these environment variables:
```bash
REFRESH_TOKEN_KEY=your-secret-refresh-key-here
ACCESS_TOKEN_KEY=your-secret-access-key-here
```

## Token Lifespans
- **Access Token**: 5 minutes
- **Refresh Token**: 7 days

## Endpoints

### POST `/auth/register`
Register a new user and receive access and refresh tokens along with user information.

**Request:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "johndoe",
    "email": "john@example.com",
    "created_at": "2025-10-21T12:00:00Z"
  }
}
```

**Error Responses:**
- `400`: Malformed body
- `409`: Username or email already taken
- `500`: Internal server error

---

### POST `/auth/login`
Login with username or email and receive access and refresh tokens along with user information.

**Request:**
```json
{
  "username_or_email": "johndoe",
  "password": "securepassword123"
}
```

**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "johndoe",
    "email": "john@example.com",
    "created_at": "2025-10-21T12:00:00Z"
  }
}
```

**Error Responses:**
- `400`: Malformed body
- `401`: Invalid credentials (wrong username/email or password)
- `500`: Internal server error

---

### POST `/auth/refresh`
Exchange a valid refresh token for new access and refresh tokens. The old refresh token is invalidated.

**Request:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Error Responses:**
- `400`: Malformed body
- `401`: Invalid or expired refresh token
- `500`: Internal server error

---

### POST `/auth/logout`
Invalidate all tokens for the authenticated user.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "message": "logged out successfully"
}
```

**Error Responses:**
- `401`: Invalid or missing access token
- `500`: Internal server error

---

### GET `/api/me` (Protected Example)
Example protected endpoint that requires authentication.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "message": "You are authenticated!"
}
```

**Error Responses:**
- `401`: Invalid or missing access token

---

## Using the Auth Middleware

To protect any route, use the `RequireAuth()` middleware:

```go
import "github.com/Prorickey/ftcmetrics/routes"

// Protect individual routes
router.GET("/protected", routes.RequireAuth(), handler)

// Protect a group of routes
protected := router.Group("/api")
protected.Use(routes.RequireAuth())
{
    protected.GET("/me", getMe)
    protected.POST("/data", createData)
}
```

The middleware extracts the user ID and token ID and makes them available in the context:
```go
func handler(ctx *gin.Context) {
    userId, _ := ctx.Get("userId")
    tokenId, _ := ctx.Get("tokenId")
    // Use userId and tokenId...
}
```

## Database Schema

The authentication system uses three tables:

1. **users** - Stores user credentials
2. **refresh_tokens** - Tracks refresh tokens with validity status
3. **access_tokens** - Tracks access tokens with validity status

Run the `schema.sql` file to set up the database:
```bash
psql -U your_user -d your_database -f schema.sql
```

## Security Features

- **Argon2id Password Hashing**: Secure password storage
- **JWT Tokens**: Stateless authentication with database verification
- **Token Rotation**: Old tokens are invalidated when new ones are issued
- **Token Revocation**: Tokens can be invalidated (logout functionality)
- **Separate Secrets**: Different signing keys for access and refresh tokens
- **Short-lived Access Tokens**: 5-minute lifespan reduces attack window
- **Database Validation**: All tokens are verified against the database on each request
