import axios, { AxiosResponse } from 'axios';
import { 
    User, 
    Category, 
    Transaction, 
    Budget, 
    TransactionSummary, 
    CategoryBreakdown, 
    AuthTokens, 
    MonthlyData 
} from '../interfaces';

// Create axios instance
const api = axios.create({
    baseURL: 'http://localhost:8000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor for authentication and logging
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        
        // Log request details
        if (config.data) {
            console.log(`API Request ${config.method?.toUpperCase()} ${config.url}:`, config.data);
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor for better debugging
api.interceptors.response.use(
    (response) => {
        console.log(`API Response [${response.status}] ${response.config.method?.toUpperCase()} ${response.config.url}:`, response.data);
        return response;
    },
    (error) => {
        if (error.response) {
            console.error(`API Error [${error.response.status}] ${error.config.method?.toUpperCase()} ${error.config.url}:`, 
                error.response.data, 'Request data:', error.config.data);
        } else {
            console.error('API Error (No Response):', error.message);
        }
        return Promise.reject(error);
    }
);

// Auth API
export const login = (username: string, password: string): Promise<AxiosResponse<AuthTokens>> => {
    return api.post('/auth/login/', { username, password });
};

export const refreshToken = (refresh: string): Promise<AxiosResponse<{ access: string }>> => {
    return api.post('/auth/refresh/', { refresh });
};

export const fetchUser = (): Promise<AxiosResponse<User>> => {
    return api.get('/auth/user/');
};

// Categories API
export const fetchCategories = (): Promise<AxiosResponse<{ count: number, results: Category[] }>> => {
    return api.get('/categories/');
};

export const fetchCategoriesByType = (type: 'income' | 'expense'): Promise<AxiosResponse<Category[]>> => {
    return api.get(`/categories/${type}/`);
};

export const createCategory = (category: Partial<Category>): Promise<AxiosResponse<Category>> => {
    return api.post('/categories/', category);
};

export const updateCategory = (id: number, category: Partial<Category>): Promise<AxiosResponse<Category>> => {
    return api.put(`/categories/${id}/`, category);
};

export const deleteCategory = (id: number): Promise<AxiosResponse<void>> => {
    return api.delete(`/categories/${id}/`);
};

// Transactions API
export const fetchTransactions = (params?: object): Promise<AxiosResponse<{ count: number, results: Transaction[] }>> => {
    return api.get('/transactions/', { params });
};

export const createTransaction = (transaction: Partial<Transaction>): Promise<AxiosResponse<Transaction>> => {
    return api.post('/transactions/', transaction);
};

export const updateTransaction = (id: number, transaction: Partial<Transaction>): Promise<AxiosResponse<Transaction>> => {
    return api.put(`/transactions/${id}/`, transaction);
};

export const deleteTransaction = (id: number): Promise<AxiosResponse<void>> => {
    return api.delete(`/transactions/${id}/`);
};

export const fetchTransactionSummary = (params?: object): Promise<AxiosResponse<TransactionSummary>> => {
    return api.get('/transactions/summary/', { params });
};

export const fetchCategoryBreakdown = (params?: object): Promise<AxiosResponse<CategoryBreakdown[]>> => {
    return api.get('/transactions/category_breakdown/', { params });
};

export const fetchMonthlyData = (): Promise<AxiosResponse<MonthlyData[]>> => {
    return api.get('/transactions/monthly/');
};

// Budgets API
export const fetchBudgets = (): Promise<AxiosResponse<Budget[]>> => {
    return api.get('/budgets/');
};

export const fetchCurrentBudget = (): Promise<AxiosResponse<Budget>> => {
    return api.get('/budgets/current/');
};

export const createBudget = (budget: Partial<Budget>): Promise<AxiosResponse<Budget>> => {
    return api.post('/budgets/', budget);
};

export const updateBudget = (id: number, budget: Partial<Budget>): Promise<AxiosResponse<Budget>> => {
    return api.put(`/budgets/${id}/`, budget);
};

export const deleteBudget = (id: number): Promise<AxiosResponse<void>> => {
    return api.delete(`/budgets/${id}/`);
}; 