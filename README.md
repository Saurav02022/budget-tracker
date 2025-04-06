# Personal Budget Tracker

A full-stack personal finance application built with Django REST Framework and React.

## Features

- User authentication with JWT
- Financial dashboard with D3.js visualizations
- Transaction management with filtering and pagination
- Budget planning and tracking
- Category management for income/expenses
- Responsive design
- Demo account and default categories

## Tech Stack

**Backend:** Django, Django REST Framework, JWT Authentication, SQLite

**Frontend:** React, TypeScript, Chakra UI, D3.js, Axios, Vite

## Quick Start

### Demo Access
- **Frontend:** https://budget-app-demo.vercel.app
- **API:** https://budget-api-demo.onrender.com
- **Credentials:** Username: `demouser` / Password: `demopassword`

### Local Setup

**Prerequisites:** Python 3.8+, Node.js 16+, npm/yarn

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python create_default_categories.py
python create_demo_user.py
python manage.py runserver  # Runs on http://localhost:8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev  # Runs on http://localhost:5173
```

## Project Structure

```
budget-tracker/
├── backend/                  # Django backend
│   ├── budget_tracker/       # Project settings
│   ├── core/                 # Main application
│   └── ...
└── frontend/                 # React frontend
    ├── src/                  # Source code
    │   ├── api/              # API service
    │   ├── components/       # UI components
    │   ├── pages/            # Application pages
    │   └── ...
    └── ...
```

## API Endpoints

- `/api/auth/` - Authentication
- `/api/categories/` - Category management
- `/api/transactions/` - Transaction management
- `/api/budgets/` - Budget planning
- `/api/schema/swagger-ui/` - API documentation

## Development

This project was developed with the assistance of Cursor AI to accelerate:
- Project scaffolding and authentication
- Database models and API endpoints
- React components and UI design
- Testing and optimization

While Cursor AI provided assistance, all generated code was reviewed and customized to meet the application requirements.

## Deployment

**Environment Configuration:**
1. Set `DEBUG=False` in Django settings
2. Configure proper database settings
3. Set up environment variables for sensitive data
4. Update CORS settings to allow your frontend domain

## Troubleshooting

- **Database errors:** Try deleting `db.sqlite3` and running migrations again
- **Frontend issues:** Delete `node_modules` and run `npm install`
- **API connectivity:** Ensure backend is running before using frontend features

## License

MIT License

## Acknowledgments

- Built for IIT Bombay interview process
- Icons: React Icons and Chakra UI
- Visualizations: D3.js
- Development: Cursor AI coding assistant 