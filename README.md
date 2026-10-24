# StoreFront

A full-stack e-commerce: an **Angular 19** single-page app (with server-side rendering and four languages) talking to a small **Express** REST API that uses cookie-based **JWT** sessions

![Angular](https://img.shields.io/badge/Angular-19-dd0031?logo=angular&logoColor=white)
![Node](https://img.shields.io/badge/Node.js-%E2%89%A518-339933?logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6?logo=typescript&logoColor=white)

![Catalog page](docs/screenshots/catalog.png)

## Features

**Shoppers**

- Browse the catalog, filter by category and search by title
- Product detail pages with live stock badges (out of stock, low stock, recently restocked)
- Automatic discounts from active offers, shown next to the original price
- Shopping cart that survives page reloads (session storage)
- Checkout with a draggable delivery-location map (Leaflet / OpenStreetMap)
- Profile page with order history and order details
- Available in English, French, Spanish and Arabic (RTL)

**Administrators**

- Stock monitoring with restock / empty actions and low-stock alerts
- Offer management (create, edit, enable/disable, delete)
- User management (create, edit, delete)

## Tech stack

| Layer    | Technology |
| -------- | ---------- |
| Frontend | Angular 19 (standalone components, lazy routes, functional guards and interceptors), RxJS, Leaflet |
| Rendering | Angular SSR with hydration and event replay |
| i18n     | `@angular/localize`, XLIFF files for `fr`, `es`, `ar` |
| Backend  | Node.js, Express 4, `jsonwebtoken`, `cookie-parser`, `cors` |
| Security | `scrypt` password hashing, `httpOnly` + `SameSite=Strict` session cookie |
| Storage  | JSON files in `server/data` (swap for a database when needed) |

## Architecture

```mermaid
flowchart LR
    subgraph Browser
        UI["Feature components<br/>catalog, cart, checkout, admin..."]
        SVC["Core services<br/>User, Cart, Product, Offer, Order, Stock, Pricing"]
        INT["credentialsInterceptor"]
        GRD["authGuard / adminGuard"]
        UI --> SVC --> INT
        GRD --> SVC
    end

    subgraph "Angular SSR server (port 4000)"
        SSR["Express + AngularNodeAppEngine"]
    end

    subgraph "REST API (port 3000)"
        MW["requireAuth / requireAdmin"]
        RT["Routes<br/>auth, products, offers, users, orders"]
        ST["JSON store"]
        MW --> RT --> ST
    end

    DATA[("server/data/*.json")]
    ST --- DATA

    Browser -- "HTML (prerender / SSR)" --> SSR
    INT -- "HTTP + session cookie" --> MW
```

## Project structure

```text
.
├── src/
│   ├── app/
│   │   ├── core/                 # app-wide singletons
│   │   │   ├── config/           # API_URL injection token
│   │   │   ├── guards/           # authGuard, adminGuard
│   │   │   ├── interceptors/     # credentialsInterceptor
│   │   │   ├── models/           # Product, Offer, Order, User, cart types
│   │   │   └── services/         # data + state services
│   │   ├── features/             # one folder per page
│   │   │   ├── auth/             # signin, signup
│   │   │   ├── admin/            # stock-monitoring, offer-management, user-management
│   │   │   ├── cart/  catalog/  checkout/  map/
│   │   │   └── orders/  product-details/  profile/
│   │   ├── shared/               # alert, navbar, search-bar
│   │   ├── app.config.ts         # providers (router, http, hydration)
│   │   ├── app.routes.ts         # lazy routes + guards
│   │   └── app.routes.server.ts  # prerender / SSR mode per route
│   ├── locale/                   # messages.xlf + fr / es / ar translations
│   ├── main.ts  main.server.ts  server.ts
├── server/                       # REST API
│   ├── src/
│   │   ├── config.js  app.js  index.js
│   │   ├── lib/                  # JSON store, password hashing
│   │   ├── middleware/           # session + role checks
│   │   └── routes/               # auth, users, products, offers, orders
│   ├── data/                     # seed data (users, products, offers, orders)
│   └── scripts/                  # hash-password, import-products
├── docs/screenshots/
└── public/                       # static assets
```

## Getting started

### Prerequisites

- Node.js 18 or newer
- npm 9 or newer

### 1. Install

```bash
npm install            # Angular app
npm run api:install    # API server
```

### 2. Configure the API

```bash
cp server/.env.example server/.env
```

Set `JWT_SECRET` to a long random value:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 3. Run

Use two terminals:

```bash
npm run api     # API  -> http://localhost:3000
npm start       # Web  -> http://localhost:4200
```

### Demo accounts

The seed data ships with two accounts. They are for local development only - delete or change them before deploying anywhere

| Role   | Email                 | Password       |
| ------ | --------------------- | -------------- |
| Admin  | `admin@example.com`   | `Admin#12345`  |
| Member | `member@example.com`  | `Member#12345` |

## How it works

### Authentication

The API issues a signed JWT inside an `httpOnly` cookie, so the token is never readable from JavaScript. On startup the app asks `/api/me` who the user is; route guards wait for that answer before deciding.

```mermaid
sequenceDiagram
    actor U as User
    participant A as Angular app
    participant S as API

    U->>A: Submit sign-in form
    A->>S: POST /api/signin (email, password)
    S->>S: Verify scrypt hash
    S-->>A: 200 + Set-Cookie authToken (2 h)
    A->>S: GET /api/me (cookie sent by interceptor)
    S-->>A: User profile (no password)
    A->>A: Publish user in UserService
    Note over A,S: Every /api/me call renews the cookie
    U->>A: Open /stock-monitoring
    A->>A: authGuard, then adminGuard
    A-->>U: Page (admin) or redirect to /catalog
```

### Route access

```mermaid
flowchart TD
    R((Request)) --> P{Public page?}
    P -- "catalog, product-details,<br/>shopping-cart, signin, signup" --> OK1[Allowed]
    P -- no --> AU{Signed in?}
    AU -- no --> SI[Redirect to /signin]
    AU -- yes --> AD{Admin-only page?}
    AD -- "profile, order-page,<br/>order-details" --> OK2[Allowed]
    AD -- "stock-monitoring, offers,<br/>user-management" --> IS{userType = admin?}
    IS -- yes --> OK3[Allowed]
    IS -- no --> CA[Redirect to /catalog]
```

### Checkout

```mermaid
sequenceDiagram
    actor U as Shopper
    participant C as Cart / Checkout
    participant P as PricingService
    participant S as API

    U->>C: Add products
    C->>P: getDiscountedPrice(product)
    P-->>C: Best active offer applied
    U->>C: Pick delivery spot on the map, choose payment
    C->>S: POST /api/orders
    S->>S: Validate every line and check stock
    alt enough stock
        S->>S: Decrement stock, store order for the signed-in user
        S-->>C: 201 orderId
        C->>C: Clear cart, open order details
    else insufficient stock
        S-->>C: 400 message
        C-->>U: Error alert
    end
```

### Data model

```mermaid
erDiagram
    USER ||--o{ ORDER : places
    ORDER ||--|{ ORDER_ITEM : contains
    PRODUCT ||--o{ ORDER_ITEM : "is bought as"
    OFFER }o--o{ PRODUCT : discounts

    USER {
        string userId PK
        string fullName
        string email
        string password "scrypt hash"
        string userType "admin or member"
        string iban
        string bankName
        string phone
    }
    PRODUCT {
        string productId PK
        string productTitle
        number productPrice
        number productQuantity
        string productCategory
        string productImage
        date restockDate
    }
    OFFER {
        string id PK
        string title
        number discountPercent
        date startDate
        date endDate
        boolean active
        string type "special offer, promotion, discount"
        string[] productIds
    }
    ORDER {
        string orderId PK
        string userId FK
        string paymentMethod
        number shippingFee
        number totalPrice
        date orderDate
        string status "pending, confirmed, shipped, delivered, cancelled"
        json deliveryAddress "lat, lng, description"
    }
    ORDER_ITEM {
        string productId FK
        number quantity
        number price
    }
```

## API reference

Base URL: `http://localhost:3000/api`. "Session" means a valid auth cookie.

| Method | Endpoint | Access | Description |
| ------ | -------- | ------ | ----------- |
| GET | `/health` | public | Liveness check |
| POST | `/signup` | public | Create a member account |
| POST | `/signin` | public | Sign in, sets the auth cookie |
| POST | `/signout` | session | Clear the cookie |
| GET | `/me` | session | Current user, renews the cookie |
| GET | `/products` | public | List products |
| GET | `/products/:id` | public | One product |
| PUT | `/products/:id/stock` | admin | Add stock (`quantity > 0`) or empty it (`0`) |
| GET | `/offers`, `/offers/:id` | public | List / read offers |
| POST, PUT, DELETE | `/offers`, `/offers/:id` | admin | Manage offers |
| GET, POST | `/users` | admin | List / create users |
| PUT | `/users/:id` | owner or admin | Update profile fields |
| DELETE | `/users/:id` | admin | Delete a user |
| POST | `/orders` | session | Place an order (uses the signed-in user) |
| GET | `/orders/user/:userId` | owner or admin | Orders of a user |
| GET | `/orders/:orderId` | owner or admin | One order |

## Screenshots

| Sign in | Sign up |
| :---: | :---: |
| ![Sign in](docs/screenshots/signin.png) | ![Sign up](docs/screenshots/signup.png) |

| Catalog | Product details |
| :---: | :---: |
| ![Catalog](docs/screenshots/catalog.png) | ![Product details](docs/screenshots/product-details.png) |

| Cart | Checkout |
| :---: | :---: |
| ![Cart](docs/screenshots/cart.png) | ![Checkout](docs/screenshots/checkout.png) |

| Profile | Order details |
| :---: | :---: |
| ![Profile](docs/screenshots/profile.png) | ![Order details](docs/screenshots/order-details.png) |

| Stock monitoring | Offer management |
| :---: | :---: |
| ![Stock monitoring](docs/screenshots/stock-monitoring.png) | ![Offer management](docs/screenshots/offer-management.png) |

| User management | Arabic (RTL) |
| :---: | :---: |
| ![User management](docs/screenshots/user-management.png) | ![Arabic](docs/screenshots/i18n-arabic.png) |

## Internationalization

English is the source language; `fr`, `es` and `ar` live in `src/locale`.

```bash
npm run start:fr            # dev server in French (also start:es, start:ar)
npm run build               # production build, all locales
```

After changing template text, refresh the translation catalogs:

```bash
npx ng extract-i18n --output-path src/locale
```

Then merge the new units into the `messages.<locale>.xlf` files and translate them

## Scripts

| Command | What it does |
| ------- | ------------ |
| `npm start` | Angular dev server on port 4200 |
| `npm run build` | Production build (SSR, every locale) |
| `npm test` | Unit tests (Karma + Jasmine) |
| `npm run api` | Start the REST API |
| `npm run api:install` | Install the API dependencies |
| `npm --prefix server run dev` | API with auto-reload |
| `npm --prefix server run import:products` | Rebuild `products.json` from DummyJSON |
| `npm --prefix server run hash-password -- "pw"` | Print a password hash for `users.json` |
