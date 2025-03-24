# Instalabel SaaS Documentation

## Table of Contents
1. [Introduction](#introduction)
2. [System Architecture](#system-architecture)
3. [Core Domains](#core-domains)
4. [Data Models](#data-models)
5. [API Endpoints](#api-endpoints)
6. [Multi-Tenancy](#multi-tenancy)
7. [Subscription & Billing](#subscription--billing)
8. [Authentication & Authorization](#authentication--authorization)
9. [Development Setup](#development-setup)
10. [Deployment](#deployment)
11. [Feature Roadmap](#feature-roadmap)
12. [Technical Considerations](#technical-considerations)

## Introduction

InstaLabel is a multi-tenant SaaS platform providing commercial kitchens with a comprehensive labeling solution to ensure compliance with food safety regulations, including Natasha's Law. The platform helps kitchen operations increase profitability, reduce food wastage, minimize administrative overhead, and enhance staff productivity.

### Key Business Objectives

- Ensure compliance with food safety regulations (including Natasha's Law)
- Increase kitchen profitability and operational efficiency (up to 75% reduction in admin time)
- Reduce food wastage through better inventory management
- Enhance staff productivity through streamlined workflows

### Core Functionality

- Label generation and printing (compliance, allergen, prep/production labels)
- Recipe and ingredient management with automatic allergen calculation
- Inventory and expiry management with alerts
- Compliance documentation and audit trails

## System Architecture

The system follows a domain-driven design (DDD) approach with a clean, layered architecture:

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  Client Layer                                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────┐ │
│  │ Web         │  │ Mobile App  │  │ Tablet App  │  │ POS     │ │
│  │ Application │  │             │  │             │  │ Systems │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────┘ │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│  API Gateway Layer                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │ Auth &      │  │ Rate        │  │ API         │             │
│  │ Tenant      │  │ Limiting    │  │ Versioning  │             │
│  │ Resolution  │  │             │  │             │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│  Service Layer                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────┐ │
│  │ Label       │  │ Recipe &    │  │ Inventory   │  │ User &  │ │
│  │ Service     │  │ Ingredient  │  │ Management  │  │ Tenant  │ │
│  │             │  │ Service     │  │ Service     │  │ Service │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────┘ │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────┐ │
│  │ Compliance  │  │ Reporting   │  │ Billing     │  │ Printer │ │
│  │ Service     │  │ Service     │  │ Service     │  │ Service │ │
│  │             │  │             │  │             │  │         │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────┘ │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│  Data Layer                                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────┐ │
│  │ Primary     │  │ Read        │  │ Cache       │  │ Blob    │ │
│  │ Database    │  │ Replicas    │  │ Layer       │  │ Storage │ │
│  │             │  │             │  │             │  │         │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Layers

1. **Domain Layer**: Entities, interfaces, and domain services that represent the core business logic
2. **Application Layer**: Application services, DTOs, and use cases
3. **Infrastructure Layer**: Database repositories, external integrations
4. **API Layer**: Controllers, routes, middlewares, and request/response handling
5. **Presentation Layer**: Web/mobile interfaces (separate projects)

### Technology Stack

- **Backend**: TypeScript, Express.js, MongoDB, Mongoose
- **Authentication**: JWT-based with role-based permissions
- **Caching**: Redis
- **Infrastructure**: Docker, Kubernetes
- **CI/CD**: GitHub Actions

## Core Domains

### Tenant Management

The tenant domain handles multi-tenancy aspects:
- Tenant registration and configuration
- Subscription plan management
- White-labeling options

### User Management

The user domain manages user accounts:
- User registration and authentication
- Role-based access control (admin, manager, staff)
- User preferences and settings

### Recipe & Ingredient Management

This domain handles food items and recipes:
- Ingredient database with allergen information
- Recipe creation and versioning
- Allergen calculation based on ingredients

### Inventory Management

The inventory domain tracks stock and expiry:
- Inventory tracking by location
- Expiry date monitoring
- Low-stock alerts

### Label Generation

This domain handles the creation of various label types:
- Allergen labels (Natasha's Law compliance)
- Prep/production labels
- Expiry labels
- Custom label templates

### Printer Management

Handles integration with various printers:
- Printer configuration
- Print job management
- Label template rendering

## Data Models

### Core Entities

#### Tenant
- Basic properties: name, contact information
- Billing information
- White-label settings
- Subscription details

#### User
- Authentication details
- Role-based permissions
- Tenant association

#### Ingredient
```typescript
{
  tenantId: ObjectId,
  name: string,
  description?: string,
  allergens: string[],
  nutritionalInfo?: {
    calories?: number,
    protein?: number,
    fat?: number,
    carbs?: number
  },
  supplierInfo?: {
    supplierId?: string,
    supplierName?: string,
    sku?: string
  },
  defaultUnit: string,
  isActive: boolean
}
```

#### Recipe
```typescript
{
  tenantId: ObjectId,
  name: string,
  description?: string,
  category?: string,
  version: number,
  status: 'draft' | 'active' | 'archived',
  ingredients: [
    {
      ingredientId: ObjectId,
      quantity: number,
      unit: string,
      preparationNotes?: string
    }
  ],
  allergens: string[],
  preparationInstructions?: string,
  cookingInstructions?: string,
  servingSize?: number,
  servingUnit?: string,
  yield?: number,
  yieldUnit?: string,
  isActive: boolean,
  createdBy: ObjectId,
  updatedBy?: ObjectId
}
```

#### InventoryItem
```typescript
{
  tenantId: ObjectId,
  locationId?: ObjectId,
  ingredientId: ObjectId,
  batchNumber?: string,
  quantity: number,
  unit: string,
  deliveryDate: Date,
  expiryDate: Date,
  storageLocation?: string,
  supplier?: string,
  cost?: number,
  isActive: boolean,
  createdBy: ObjectId
}
```

#### Label
```typescript
{
  tenantId: ObjectId,
  locationId?: ObjectId,
  recipeId?: ObjectId,
  inventoryItemId?: ObjectId,
  labelType: 'prep' | 'allergen' | 'expiry' | 'custom',
  name: string,
  content: {
    recipeName?: string,
    preparedBy?: string,
    prepDate?: Date,
    useByDate?: Date,
    expiryDate?: Date,
    allergens?: string[],
    ingredients?: string,
    storageInstructions?: string,
    additionalInfo?: string,
    barcodeData?: string
  },
  printedBy?: ObjectId,
  printedDate?: Date,
  isActive: boolean,
  createdBy: ObjectId
}
```

#### Subscription
```typescript
{
  tenantId: ObjectId,
  plan: 'basic' | 'professional' | 'enterprise' | 'custom',
  status: 'active' | 'past_due' | 'canceled' | 'trialing',
  startDate: Date,
  endDate: Date,
  features: {
    maxUsers: number,
    maxLocations: number,
    maxRecipes: number,
    maxLabelsPerMonth: number,
    whiteLabeling: boolean,
    inventoryManagement: boolean,
    advancedReporting: boolean,
    apiAccess: boolean
  },
  paymentInfo?: {
    provider?: string,
    customerId?: string,
    subscriptionId?: string,
    lastPaymentDate?: Date,
    nextPaymentDate?: Date
  }
}
```

## API Endpoints

### Authentication

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/auth/signup` | POST | Register a new user |
| `/api/v1/auth/login` | POST | Login and get JWT token |
| `/api/v1/auth/forgot-password` | POST | Request password reset |
| `/api/v1/auth/reset-password/:token` | PATCH | Reset password with token |
| `/api/v1/auth/me` | GET | Get current user profile |
| `/api/v1/auth/update-password` | PATCH | Update current user password |

### Tenants

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/tenants` | POST | Create a new tenant |
| `/api/v1/tenants` | GET | Get all tenants (admin only) |
| `/api/v1/tenants/:id` | GET | Get a tenant by ID |
| `/api/v1/tenants/:id` | PUT | Update a tenant |
| `/api/v1/tenants/:id` | DELETE | Delete a tenant |

### Users

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/users` | POST | Create a user (admin/manager) |
| `/api/v1/users/tenant/:tenantId` | GET | Get users by tenant |
| `/api/v1/users/:id` | GET | Get a user by ID |
| `/api/v1/users/:id` | PATCH | Update a user |
| `/api/v1/users/:id` | DELETE | Delete a user |

### Ingredients

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/ingredients` | POST | Create an ingredient |
| `/api/v1/ingredients` | GET | Get all ingredients for tenant |
| `/api/v1/ingredients/:id` | GET | Get an ingredient by ID |
| `/api/v1/ingredients/:id` | PUT | Update an ingredient |
| `/api/v1/ingredients/:id` | DELETE | Delete an ingredient |
| `/api/v1/ingredients/allergen/:allergen` | GET | Get ingredients by allergen |

### Recipes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/recipes` | POST | Create a recipe |
| `/api/v1/recipes` | GET | Get all recipes for tenant |
| `/api/v1/recipes/:id` | GET | Get a recipe by ID |
| `/api/v1/recipes/:id` | PUT | Update a recipe |
| `/api/v1/recipes/:id` | DELETE | Delete a recipe |
| `/api/v1/recipes/category/:category` | GET | Get recipes by category |
| `/api/v1/recipes/status/:status` | GET | Get recipes by status |
| `/api/v1/recipes/allergen/:allergen` | GET | Get recipes by allergen |

### Labels

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/labels` | POST | Create a custom label |
| `/api/v1/labels/prep` | POST | Generate a prep label |
| `/api/v1/labels/allergen` | POST | Generate an allergen label |
| `/api/v1/labels/expiry` | POST | Generate an expiry label |
| `/api/v1/labels` | GET | Get all labels for tenant |
| `/api/v1/labels/:id` | GET | Get a label by ID |
| `/api/v1/labels/:id` | PUT | Update a label |
| `/api/v1/labels/:id` | DELETE | Delete a label |
| `/api/v1/labels/type/:type` | GET | Get labels by type |
| `/api/v1/labels/recipe/:recipeId` | GET | Get labels by recipe ID |
| `/api/v1/labels/:id/print` | PATCH | Mark a label as printed |
| `/api/v1/labels/batch-print` | POST | Mark multiple labels as printed |

### Inventory

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/inventory` | POST | Add inventory item |
| `/api/v1/inventory` | GET | Get all inventory items |
| `/api/v1/inventory/:id` | GET | Get inventory item by ID |
| `/api/v1/inventory/:id` | PUT | Update inventory item |
| `/api/v1/inventory/:id` | DELETE | Delete inventory item |
| `/api/v1/inventory/:id/adjust` | PATCH | Adjust inventory quantity |
| `/api/v1/inventory/ingredient/:ingredientId` | GET | Get inventory by ingredient |
| `/api/v1/inventory/location/:locationId` | GET | Get inventory by location |
| `/api/v1/inventory/expiring/items` | GET | Get soon-to-expire items |
| `/api/v1/inventory/expired/items` | GET | Get expired items |
| `/api/v1/inventory/ingredient/:ingredientId/total` | GET | Get total stock of ingredient |

### Subscriptions

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/subscriptions` | POST | Create subscription for current tenant |
| `/api/v1/subscriptions/current` | GET | Get current tenant's subscription |
| `/api/v1/subscriptions` | PUT | Update current tenant's subscription |
| `/api/v1/subscriptions` | DELETE | Cancel current tenant's subscription |
| `/api/v1/subscriptions/:tenantId` | POST | Create subscription for tenant (superadmin) |
| `/api/v1/subscriptions/:tenantId` | GET | Get tenant's subscription (superadmin) |
| `/api/v1/subscriptions/:tenantId` | PUT | Update tenant's subscription (superadmin) |
| `/api/v1/subscriptions/:tenantId` | DELETE | Cancel tenant's subscription (superadmin) |

### Usage Tracking

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/usage/summary` | GET | Get usage summary for current tenant |
| `/api/v1/usage/feature/:feature` | GET | Check feature access for current tenant |
| `/api/v1/usage/:tenantId/summary` | GET | Get usage summary for tenant (superadmin) |

### Admin

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/admin/subscriptions` | GET | Get all subscriptions (superadmin) |
| `/api/v1/admin/subscriptions/plan/:plan` | GET | Get subscriptions by plan (superadmin) |
| `/api/v1/admin/subscriptions/analytics` | GET | Get subscription analytics (superadmin) |

### Webhooks

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/webhooks/stripe` | POST | Stripe webhook endpoint |

## Multi-Tenancy

The application implements a hybrid multi-tenancy approach:

### Database Level

- MongoDB with tenant field in all documents
- Collection-per-tenant option for large enterprise clients
- Database-per-tenant option for highest isolation needs

### Application Level

- Tenant context maintained throughout request pipeline with middleware
- Automatic tenant filtering in repository layer
- Resource isolation via tenant-specific connection pools

### Key Multi-Tenant Features

1. **Tenant Identification**: JWT tokens contain tenant context
2. **Data Isolation**: Repository layer ensures data isolation
3. **Feature Access**: Subscription-based feature access control
4. **White-labeling**: Tenant-specific branding options
5. **Hierarchical Structure**: Support for HQ → Regional → Location hierarchy

## Subscription & Billing

The system includes a complete subscription management system:

### Subscription Plans

| Plan | Features |
|------|----------|
| **Basic** ($99/month) | 3 Users, 1 Location, 100 Recipes, 1,000 Labels/month |
| **Professional** ($199/month) | 10 Users, 3 Locations, 500 Recipes, 5,000 Labels/month, Inventory management, Advanced reporting |
| **Enterprise** (Custom pricing) | 100 Users, Unlimited Locations, 10,000 Recipes, 100,000 Labels/month, White-labeling, API access |

### Billing Integration

The system integrates with payment processors (modeled after Stripe):
- Customer creation
- Subscription management
- Payment processing
- Webhooks for payment events

### Usage Tracking

The platform tracks usage against subscription limits:
- User count
- Recipe count
- Monthly label generation
- Feature access

## Authentication & Authorization

### Authentication Flow

1. User logs in with email/password
2. Server validates credentials and issues JWT
3. JWT contains user ID, tenant ID, and role
4. Client includes JWT in Authorization header for subsequent requests

### Role-Based Access Control

The system supports multiple roles with different permissions:

| Role | Permissions |
|------|-------------|
| **Admin** | Full access to tenant data, user management, subscription management |
| **Manager** | Recipe, ingredient, inventory, and label management |
| **Staff** | Basic operations (view recipes, print labels, update inventory) |
| **Superadmin** | System-wide access (created by system) |

### Middleware Protections

Multiple middleware layers protect resources:
- Authentication middleware (`protect`)
- Role-based middleware (`restrictTo`)
- Tenant context middleware (`ensureTenantContext`)
- Subscription limit middleware (`checkUserLimit`, `checkRecipeLimit`, etc.)

## Development Setup

### Prerequisites

- Node.js (v18+)
- MongoDB
- Docker and Docker Compose (optional)

### Local Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables (.env):
   ```
   NODE_ENV=development
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/kitchen-labeling
   JWT_SECRET=your-secure-jwt-secret
   JWT_EXPIRES_IN=1d
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

### Docker Setup

1. Build and start containers:
   ```bash
   npm run docker:up
   ```
2. Access the application at http://localhost:3006
3. MongoDB will be available at localhost:27033
4. Mongo GUI available at http://localhost:4325

### Seeding Data

Run the seed script to create initial data:
```bash
npm run seed
```

This creates:
- A demo tenant
- Admin, manager, and staff users
- Sample ingredients and recipes

## Deployment

### Production Considerations

1. **Infrastructure**: Deploy using Kubernetes for production
2. **Database**: Use MongoDB Atlas or a managed MongoDB service
3. **Security**: Ensure proper network security, use a reverse proxy
4. **Monitoring**: Set up monitoring with Prometheus and Grafana
5. **Logging**: Implement centralized logging with ELK Stack

### Deployment Pipeline

1. **Environments**: Dev → Test → Staging → Production
2. **CI/CD**: Configure GitHub Actions for automated testing and deployment
3. **Deployment Strategy**: Use blue/green deployment
4. **Database Migrations**: Automate database migrations

## Feature Roadmap

### Phase 1: MVP (3 months)

- Core label generation and printing
- Basic recipe and ingredient management
- Simple tenant management
- Essential compliance features
- Web application for management

### Phase 2: Enhanced Functionality (3 months)

- Inventory tracking and expiry management
- Mobile application
- Advanced reporting
- Integration with common POS systems
- Offline mode support

### Phase 3: Enterprise Features (6 months)

- White-labeling capabilities
- Advanced multi-location support
- Custom workflows and approval processes
- API for third-party integrations
- Advanced analytics and recommendations

## Technical Considerations

### Performance Optimization

- **Indexing Strategy**: Optimal MongoDB indexes for common queries
- **Caching**: Redis caching for frequently accessed data
- **Query Optimization**: Efficient query patterns and projections
- **Pagination**: Implement pagination for large data sets

### Scalability

- **Horizontal Scaling**: Stateless design for easy scaling
- **Database Scaling**: MongoDB sharding and replication
- **Microservices**: Future migration path to microservices

### Security

- **Data Encryption**: Encryption at rest and in transit
- **Input Validation**: Thorough validation at API boundaries
- **XSS & CSRF Protection**: Security headers and tokens
- **Rate Limiting**: Protection against abuse

### Testing Strategy

- **Unit Tests**: 80%+ coverage for business logic
- **Integration Tests**: API and service interaction testing
- **E2E Tests**: Critical user journeys
- **Load Testing**: Performance under high volume

This documentation provides a comprehensive overview of the Commercial Kitchen Labeling SaaS platform. It should be maintained alongside the codebase to ensure it remains up-to-date as the system evolves.
