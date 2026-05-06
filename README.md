# Italian Store Backend (Express + MongoDB)

Production-ready backend structure for your Italian e-commerce/food website sections:

- Home
- Menu
- Dishes + Dish details
- Dietary
- Cart
- Orders
- Profile
- Addresses
- Payments (QiCard)
- Auth

## Quick Start

```bash
npm install
npm run dev
```

Server starts on:

```text
http://localhost:5000
```

Health check:

```text
GET /health
```

## Project Structure

```text
src/
  app.js
  server.js
  config/db.js
  controllers/
  middleware/
  models/
  routes/
  services/payment/qiGateway.js
  utils/jwt.js
```

## Environment

Copy `.env.example` and update values as needed.

Important:

- `MONGO_URI` points to MongoDB Atlas
- `QI_*` variables are used for QiCard Payment Gateway
- `JWT_SECRET` must be changed to a secure random value in production

## API Endpoints

Base: `/api/v1`

### Auth

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `PATCH /auth/me`
- `PATCH /auth/password`

### Home

- `GET /home`

### Menu

- `GET /menu`
- `GET /menu/categories`
- `GET /menu/categories/:category`

### Dishes

- `GET /dishes`
- `GET /dishes/:idOrSlug`
- `POST /dishes` (admin)
- `PATCH /dishes/:id` (admin)
- `DELETE /dishes/:id` (admin)

### Dietary

- `GET /dietary`
- `POST /dietary` (admin)
- `PATCH /dietary/:id` (admin)
- `DELETE /dietary/:id` (admin)

### Cart

- `GET /cart`
- `POST /cart/items`
- `PATCH /cart/items/:dishId`
- `DELETE /cart/items/:dishId`
- `DELETE /cart`

### Orders

- `POST /orders`
- `GET /orders`
- `GET /orders/:id`
- `PATCH /orders/:id/cancel`
- `PATCH /orders/:id/status` (admin)

### Profile

- `GET /profile`
- `PATCH /profile`
- `POST /profile/favorites/:dishId`

### Addresses

- `GET /addresses`
- `POST /addresses`
- `PATCH /addresses/:id`
- `DELETE /addresses/:id`
- `PATCH /addresses/:id/default`

### Payments (QiCard)

- `POST /payments/create`
- `GET /payments/:paymentId/status`
- `POST /payments/:paymentId/cancel`
- `POST /payments/:paymentId/refund` (admin)
- `POST /payments/webhook` (public callback endpoint)

## QiCard Integration Notes

Implemented based on Qi docs endpoint flow:

- `POST /payment`
- `GET /payment/{paymentId}/status`
- `POST /payment/{paymentId}/cancel`
- `POST /payment/{paymentId}/refund`

The service is located in:

- `src/services/payment/qiGateway.js`

Webhook signature verification is supported via:

- `QI_WEBHOOK_VERIFY`
- `QI_WEBHOOK_PUBLIC_KEY`

