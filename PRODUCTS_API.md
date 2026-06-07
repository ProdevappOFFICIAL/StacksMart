# Products API Documentation

## Overview
The Products API allows you to manage products within a store. All authenticated endpoints require a valid JWT token in the Authorization header.

## Base URL
```
/v1/stores/:storeId/products
```

---

## Endpoints

### 1. Create Product
Create a new product in your store.

**Endpoint:** `POST /v1/stores/:storeId/products`

**Authentication:** Required

**Headers:**
```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Digital Art Collection",
  "description": "Exclusive NFT artwork collection",
  "price": 100,
  "currency": "SOL",
  "category": "Digital Art",
  "stock": 50,
  "images": [
    "https://example.com/image1.jpg",
    "https://example.com/image2.jpg"
  ],
  "metadata": {
    "artist": "John Doe",
    "edition": "Limited"
  },
  "status": "active"
}
```

**Field Details:**
- `name` (required): Product name
- `description` (optional): Product description
- `price` (required): Product price (decimal)
- `currency` (optional): Either "SOL" or "USDC" (defaults to "SOL")
- `category` (optional): Product category
- `stock` (optional): Number of items available, or "unlimited" for unlimited stock
- `images` (optional): Array of image URLs
- `metadata` (optional): Additional product metadata as JSON object
- `status` (optional): "active", "draft", or "inactive" (defaults to "active")

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "clx123abc",
    "name": "Digital Art Collection",
    "description": "Exclusive NFT artwork collection",
    "price": "100.0000",
    "currency": "SOL",
    "category": "Digital Art",
    "stock": 50,
    "sales": 0,
    "revenue": "0",
    "status": "active",
    "createdAt": "2026-02-09T10:30:00.000Z"
  }
}
```

---

### 2. Get Store Products
Retrieve all products for a store with pagination and filtering.

**Endpoint:** `GET /v1/stores/:storeId/products`

**Authentication:** Not required (public endpoint)

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `status` (optional): Filter by status ("active", "draft", "inactive")
- `category` (optional): Filter by category
- `search` (optional): Search in product name and description

**Example Request:**
```
GET /v1/stores/clx123abc/products?page=1&limit=10&status=active&search=art
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "clx123abc",
        "name": "Digital Art Collection",
        "description": "Exclusive NFT artwork collection",
        "price": "100.0000",
        "currency": "SOL",
        "sales": 15,
        "revenue": "1500.0000",
        "status": "active",
        "category": "Digital Art",
        "stock": 35,
        "images": ["https://example.com/image1.jpg"]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    }
  }
}
```

---

### 3. Get Single Product
Retrieve detailed information about a specific product.

**Endpoint:** `GET /v1/stores/:storeId/products/:productId`

**Authentication:** Not required (public endpoint)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "clx123abc",
    "name": "Digital Art Collection",
    "description": "Exclusive NFT artwork collection",
    "price": "100.0000",
    "currency": "SOL",
    "category": "Digital Art",
    "stock": 35,
    "images": ["https://example.com/image1.jpg"],
    "metadata": {
      "artist": "John Doe",
      "edition": "Limited"
    },
    "status": "active",
    "sales": 15,
    "store": {
      "name": "My Store",
      "slug": "my-store"
    },
    "createdAt": "2026-02-09T10:30:00.000Z"
  }
}
```

---

### 4. Update Product
Update an existing product in your store.

**Endpoint:** `PUT /v1/stores/:storeId/products/:productId`

**Authentication:** Required

**Headers:**
```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

**Request Body (all fields optional):**
```json
{
  "name": "Updated Product Name",
  "description": "Updated description",
  "price": 150,
  "currency": "USDC",
  "category": "New Category",
  "stock": 100,
  "images": ["https://example.com/new-image.jpg"],
  "metadata": {
    "updated": true
  },
  "status": "active"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "clx123abc",
    "name": "Updated Product Name",
    "description": "Updated description",
    "price": "150.0000",
    "currency": "USDC",
    "category": "New Category",
    "stock": 100,
    "status": "active",
    "updatedAt": "2026-02-09T11:00:00.000Z"
  }
}
```

---

### 5. Delete Product
Delete a product from your store.

**Endpoint:** `DELETE /v1/stores/:storeId/products/:productId`

**Authentication:** Required

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Product deleted successfully"
  }
}
```

---

## Frontend Integration Examples

### React/Next.js Example

```typescript
// Create Product
const createProduct = async (storeId: string, productData: any) => {
  const response = await fetch(`/api/v1/stores/${storeId}/products`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(productData)
  });
  
  return await response.json();
};

// Get Products with Pagination
const getProducts = async (storeId: string, page = 1, filters = {}) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: '20',
    ...filters
  });
  
  const response = await fetch(
    `/api/v1/stores/${storeId}/products?${params}`
  );
  
  return await response.json();
};

// Get Single Product
const getProduct = async (storeId: string, productId: string) => {
  const response = await fetch(
    `/api/v1/stores/${storeId}/products/${productId}`
  );
  
  return await response.json();
};

// Update Product
const updateProduct = async (
  storeId: string, 
  productId: string, 
  updates: any
) => {
  const response = await fetch(
    `/api/v1/stores/${storeId}/products/${productId}`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    }
  );
  
  return await response.json();
};

// Delete Product
const deleteProduct = async (storeId: string, productId: string) => {
  const response = await fetch(
    `/api/v1/stores/${storeId}/products/${productId}`,
    {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    }
  );
  
  return await response.json();
};
```

### Usage in Component

```typescript
import { useState, useEffect } from 'react';

function ProductList({ storeId }: { storeId: string }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const result = await getProducts(storeId, page, {
        status: 'active'
      });
      
      if (result.success) {
        setProducts(result.data.products);
      }
      setLoading(false);
    };

    fetchProducts();
  }, [storeId, page]);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {products.map((product: any) => (
        <div key={product.id}>
          <h3>{product.name}</h3>
          <p>{product.description}</p>
          <p>Price: {product.price} {product.currency}</p>
          <p>Stock: {product.stock === 'unlimited' ? '∞' : product.stock}</p>
          <p>Sales: {product.sales}</p>
        </div>
      ))}
    </div>
  );
}
```

---

## Error Responses

All endpoints may return the following error responses:

**400 Bad Request:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data"
  }
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  }
}
```

**404 Not Found:**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Store not found or access denied"
  }
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "Failed to process request"
  }
}
```

---

## Notes

- All price and revenue values are returned as strings to preserve decimal precision
- Stock can be a number or "unlimited" for unlimited inventory
- Currency must be either "STX" or "USDCX"
- Product status values: "active", "draft", "inactive"
- Sales and revenue are calculated from completed orders only
- Images should be uploaded separately and URLs provided in the images array
