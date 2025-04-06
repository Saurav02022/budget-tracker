export interface User {
    id: number;
    username: string;
    email: string;
}

export interface Category {
    id: number;
    name: string;
    type: 'income' | 'expense';
}

export interface Transaction {
    id: number;
    amount: number;
    type: 'income' | 'expense';
    description: string | null;
    date: string;
    category: number;
    category_name?: string;
    created_at: string;
}

export interface Budget {
    id: number;
    month: string;
    month_display: string;
    amount: string;
    spent?: string;
    remaining?: string;
    percentage_spent?: number;
}

export interface TransactionSummary {
    total_income: number;
    total_expenses: number;
    balance: number;
}

export interface CategoryBreakdown {
    category_id: number;
    category_name: string;
    category_type: 'income' | 'expense';
    total_amount: number;
    percentage: number;
}

export interface AuthTokens {
    access: string;
    refresh: string;
    user: User;
}

export interface MonthlyData {
    month: string;
    income: number;
    expense: number;
} 