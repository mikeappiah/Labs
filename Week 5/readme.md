# API Documentation

## Introduction

This documentation provides an overview of the API endpoints, authentication methods, error handling, and data models for the product management system. The API allows for user authentication and management, as well as product management with category-based organization.

## Authentication

The API uses session-based authentication with JWT tokens. Tokens are generated upon user login and stored in sessions. Protected routes require an active session to access.

### Authentication Endpoints

#### Signup

**URL:** `/auth/signup`  
**Method:** `POST`

**Request Body:**

```json
{
  "name": "string",
  "email": "string",
  "password": "string",
  "passwordConfirm": "string"
}
```

**Response:** Redirects to `/auth/login`.

---

#### Login

**URL:** `/auth/login`  
**Method:** `POST`

**Request Body:**

```json
{
  "email": "string",
  "password": "string"
}
```

**Response:** Redirects to `/` on success.

---

#### Logout

**URL:** `/auth/logout`  
**Method:** `GET`

**Response:** Redirects to `/auth/login`.

---

## Product Endpoints

### Public Endpoints

#### Get All Products

**URL:** `/products`  
**Method:** `GET`

**Response:**

```json
[
  {
    "_id": "string",
    "name": "string",
    "price": "number",
    "category": "string",
    "photo": "string"
  }
]
```

---

### Protected Endpoints

#### Create Product

**URL:** `/products`  
**Method:** `POST`

**Request Body:**

```json
{
  "name": "string",
  "price": "number",
  "category": "string",
  "photo": "string"
}
```

**Response:** Redirects to `/shop`.

---

#### Update Product

**URL:** `/products/:id`  
**Method:** `PATCH`

**Request Body:**

```json
{
  "name": "string",
  "price": "number",
  "category": "string",
  "photo": "string"
}
```

**Response:** Redirects to `/`.

---

#### Delete Product

**URL:** `/products/:id`  
**Method:** `DELETE`

**Response:** Redirects to `/`.

---

#### Search Products

**URL:** `/products/search`  
**Method:** `GET`

**Query Parameters:**

- `name`: Product name (partial match).

**Response:** Renders `search-product` view with search results.

---

#### Get Products by Category

**URL:** `/products/:category`  
**Method:** `GET`

**Response:** Renders `categories` view with products grouped by category.

---

## Error Handling

Errors are managed centrally through an `errorController`. Custom `AppError` instances are supported for more detailed error responses.

**Example Response:**

```json
{
  "errorCode": "string",
  "message": "string"
}
```

## Models

### User Model

| Field             | Type   | Required | Additional Info                                |
| ----------------- | ------ | -------- | ---------------------------------------------- |
| name              | String | Yes      |                                                |
| email             | String | Yes      | Unique, validated with `validator` library     |
| role              | String | No       | Enum: `user`, `admin`; default: `user`         |
| password          | String | Yes      | Hashed with bcrypt before saving               |
| passwordConfirm   | String | Yes      | Must match `password`                          |
| passwordChangedAt | Date   | No       | Automatically updated on password modification |

---

### Product Model

| Field     | Type   | Required | Additional Info                             |
| --------- | ------ | -------- | ------------------------------------------- |
| name      | String | Yes      | Unique, trimmed                             |
| price     | Number | Yes      | Minimum value: 0                            |
| photo     | String | No       | URL to product image                        |
| category  | String | Yes      | Enum of predefined categories               |
| createdAt | Date   | No       | Automatically set to the creation timestamp |

---

## Middleware

### Authentication Middleware

**protect:** Ensures the user is logged in by verifying the session token.

---

## Environment Variables

- `DATABASE`: MongoDB connection string
- `JWT_SECRET`: Secret key for signing tokens
- `JWT_EXPIRES_IN`: Token expiration time (e.g., `1h`)
- `SESSION_SECRET`: Secret key for session management
- `NODE_ENV`: Application environment (`development` or `production`)

---

## Example Usage

### Fetch All Products

**Request:**

```bash
GET /products
```

**Response:**

```json
[
  {
    "_id": "123",
    "name": "Laptop",
    "price": 1200,
    "category": "electronics",
    "photo": "/uploads/laptop.jpg"
  }
]
```

### Add a New Product

**Request:**

```bash
POST /products
```

```json
{
  "name": "Smartphone",
  "price": 799,
  "category": "electronics",
  "photo": "uploads/smartphone.jpg"
}
```

**Response:** Redirects to `/shop`.

---
