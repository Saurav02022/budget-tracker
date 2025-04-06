# Personal Budget Tracker Documentation

## Project Overview

This personal budget tracker application allows users to manage their finances by tracking income, expenses, and overall budget. Users can categorize transactions, set and monitor monthly budgets, and view their financial data through interactive visualizations.

## Design Approach and Architecture

### Backend Architecture

The backend follows a RESTful API design pattern using Django and Django REST Framework:

1. **Models**:
   - `User`: Django's built-in user model for authentication
   - `Category`: For categorizing transactions (income or expense)
   - `Transaction`: Storing financial transactions with amount, date, type, etc.
   - `Budget`: Monthly budget targets to compare against actual expenses

2. **Authentication**:
   - JWT-based authentication using `djangorestframework-simplejwt`
   - Token-based authentication flow with access and refresh tokens

3. **API Design**:
   - RESTful endpoints with consistent naming conventions
   - ViewSets for CRUD operations
   - Filter support for transactions (date, category, type, amount)
   - Summary and statistical endpoints for dashboard data

4. **Security**:
   - User-specific data isolation
   - Authentication required for all private endpoints
   - Input validation at serializer level
   - CORS configuration for frontend access

### Frontend Architecture

The frontend uses React with TypeScript and follows these architectural patterns:

1. **Component Structure**:
   - Atomic design approach with reusable components
   - Page components for main sections (Dashboard, Transactions, Budget, Categories)
   - Shared UI components for consistency

2. **Data Flow**:
   - Context-based state management for authentication
   - Component-specific state for UI interactions
   - API service layer for server communication
   - Axios interceptors for token management

3. **Routing**:
   - Protected routes requiring authentication
   - Public routes for login
   - Nested route structure
   - Redirect handling for unauthorized access

4. **UI/UX Design**:
   - Responsive design for all device sizes
   - Chakra UI for consistent styling
   - Intuitive navigation with sidebar
   - Data visualizations using D3.js (pie charts, bar charts)
   - Loading states and error handling UI

## Code Design Decisions

### Backend

1. **Model Design**:
   - Used Django's ORM for data modeling
   - Added validation logic in the Transaction model to ensure transaction type matches category type
   - Implemented model methods for data aggregation
   - Used appropriate field types for data validation

2. **API Organization**:
   - Structured endpoints by resource type
   - Added filtering capabilities to optimize data retrieval
   - Created specialized endpoints for summary data to minimize client-side processing
   - Implemented pagination for transaction lists

3. **Authentication**:
   - Chose JWT over session-based auth for better scalability and frontend integration
   - Implemented token refresh mechanism for prolonged sessions
   - Secured all non-public endpoints with authentication

### Frontend

1. **State Management**:
   - Used React Context for global state (auth)
   - Component-level state for UI functionality
   - Form state management for data collection
   - Custom hooks for reusable state logic

2. **Data Visualization**:
   - Implemented D3.js for custom charts and graphs
   - Created reusable chart components (PieChart, BarChart)
   - Server-side data aggregation to optimize visualization
   - Responsive charts that adjust to screen size

3. **Error Handling**:
   - Comprehensive error handling with user feedback
   - Form validation for data integrity
   - API error handling with toast notifications
   - Fallback UI for loading and error states

## Feature Implementation

### Authentication System
- Implemented login with JWT tokens
- Protected routes in frontend using React Router
- Auto-redirect to login when unauthorized
- Token refresh mechanism to maintain sessions

### Dashboard
- Financial summary cards showing income, expenses, and balance
- Expense breakdown pie chart using D3.js (required in assignment)
- Monthly income vs. expenses bar chart using D3.js
- Dynamic data loading based on selected time period

### Transaction Management
- CRUD operations for transactions
- Filtering by date range, category, amount and transaction type
- Pagination for transaction list (required in assignment)
- Form validation for data integrity
- Sorting functionality for better data exploration

### Budget Management
- Monthly budget setting and tracking
- Visual representation of budget vs. actual spending (required in assignment)
- Progress indicators for budget usage
- Budget history tracking

### Category Management
- CRUD operations for categories
- Separate income and expense categories
- Form validation for category creation
- Default categories for new users

## Technology Stack

### Backend
- Django 4.2
- Django REST Framework 3.14.0
- django-cors-headers for CORS support
- djangorestframework-simplejwt for JWT authentication
- SQLite for development database

### Frontend
- React 18 with TypeScript
- React Router 6 for navigation
- Chakra UI for component styling
- D3.js for data visualization (required in assignment)
- Axios for API communication
- Vite for build tooling

## Database Schema

### User
- id (PK)
- username
- email
- password (hashed)

### Category
- id (PK)
- name
- type (income/expense)
- user (FK to User)

### Transaction
- id (PK)
- user (FK to User)
- category (FK to Category)
- amount
- type (income/expense)
- description
- date
- created_at
- updated_at

### Budget
- id (PK)
- user (FK to User)
- month
- amount
- created_at
- updated_at

## API Endpoints

### Authentication
- `POST /api/auth/login/`: User login
- `POST /api/auth/refresh/`: Refresh JWT token
- `GET /api/auth/user/`: Get current user info

### Categories
- `GET /api/categories/`: List all user categories
- `POST /api/categories/`: Create new category
- `GET /api/categories/{id}/`: Retrieve category
- `PUT /api/categories/{id}/`: Update category
- `DELETE /api/categories/{id}/`: Delete category
- `GET /api/categories/income/`: List income categories
- `GET /api/categories/expense/`: List expense categories

### Transactions
- `GET /api/transactions/`: List user transactions (with pagination)
- `POST /api/transactions/`: Create transaction
- `GET /api/transactions/{id}/`: Retrieve transaction
- `PUT /api/transactions/{id}/`: Update transaction
- `DELETE /api/transactions/{id}/`: Delete transaction
- `GET /api/transactions/summary/`: Get financial summary
- `GET /api/transactions/category_breakdown/`: Get breakdown by category
- `GET /api/transactions/monthly/`: Get monthly data

### Budget
- `GET /api/budgets/`: List user budgets
- `POST /api/budgets/`: Create budget
- `GET /api/budgets/{id}/`: Retrieve budget
- `PUT /api/budgets/{id}/`: Update budget
- `DELETE /api/budgets/{id}/`: Delete budget
- `GET /api/budgets/current/`: Get current month budget

## Assumptions and Design Decisions

1. **User Roles**: The system assumes a single user role (standard user) with access to their own data only.
2. **Transaction Types**: Simplified to two transaction types (income and expense).
3. **Budget Periods**: Monthly budgets only, no weekly or yearly options.
4. **Currency**: Single currency support (displayed as $).
5. **Date Range**: No specific limits on transaction date ranges.
6. **Database Choice**: SQLite for simplicity in development; can be migrated to PostgreSQL for production.
7. **Mobile-First Design**: UI designed with mobile users in mind first, then scaled up for desktop.

## Deployment Information

The application is deployed to:

- **Frontend**: [https://budget-tracker-frontend-b53cw74e1-saurav02022s-projects.vercel.app](https://budget-tracker-frontend-b53cw74e1-saurav02022s-projects.vercel.app)
- **Backend API**: [https://budget-tracker-backend-4x2g.onrender.com](https://budget-tracker-backend-4x2g.onrender.com)

### Deployment Process

1. **Backend Deployment**:
   - Deployed to Render.com
   - Environment variables configured for production settings
   - CORS configured to allow frontend origin
   - PostgreSQL database set up for production data
   - App deployed from GitHub repository

2. **Frontend Deployment**:
   - Deployed to Vercel
   - Build configured with production API URL
   - Client-side routing supported via Vercel configuration
   - TypeScript checking bypassed during build for deployment

## Login Credentials

For testing the application, use the following credentials:

**Demo User**:
- Username: demouser
- Password: demopassword

**Admin User**:
- Username: admin
- Password: admin (for Django admin access at /admin)

## Libraries and Tools Used

### Backend Libraries
- Django
- Django REST Framework
- django-cors-headers
- djangorestframework-simplejwt
- django-filter

### Frontend Libraries
- React
- TypeScript
- React Router
- Chakra UI
- D3.js
- Axios
- React Icons
- React Hook Form

## AI Assistance Attribution

This project was developed with the assistance of Cursor AI, an LLM-powered coding assistant. Cursor AI was used to accelerate the development process in the following areas:

1. Project scaffolding and initial setup
2. Authentication system implementation
3. Database model design and API endpoints
4. React component development
5. D3.js chart implementation (for the required visualizations)
6. CSS styling and responsive design
7. Debugging and optimization
8. Documentation preparation

All AI-generated code was thoroughly reviewed, understood, and customized to fit the specific requirements of this project. The final implementation represents a combination of AI assistance and manual development work to ensure best practices and optimal functionality.

## Testing

The application includes both manual and automated testing:

1. **Manual Testing**:
   - Cross-browser compatibility testing
   - Responsive design testing across devices
   - User flow testing for all main features

2. **Automated Testing**:
   - Backend unit tests for API endpoints
   - Model validation tests
   - Authentication flow tests

## Future Enhancements

Given more time, these features could be added to enhance the application:

1. User registration and account management
2. Export/import functionality for transactions
3. Recurring transaction support
4. Financial goal setting and tracking
5. Dark/light theme toggle
6. More advanced reporting and analytics 