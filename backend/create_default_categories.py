import os
import django

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'budget_tracker.settings')
django.setup()

from django.contrib.auth.models import User
from core.models import Category

# Get the demo user
try:
    user = User.objects.get(username='demouser')
    print(f"Found user: {user.username}")
    
    # Define default categories
    income_categories = ['Salary', 'Freelance', 'Investments', 'Gifts', 'Other Income']
    expense_categories = ['Groceries', 'Rent', 'Utilities', 'Transportation', 'Entertainment', 
                         'Dining Out', 'Healthcare', 'Shopping', 'Education', 'Other Expenses']
    
    # Create income categories
    for name in income_categories:
        Category.objects.get_or_create(name=name, type='income', user=user)
        print(f"Created/verified income category: {name}")
    
    # Create expense categories
    for name in expense_categories:
        Category.objects.get_or_create(name=name, type='expense', user=user)
        print(f"Created/verified expense category: {name}")
    
    print("Default categories created successfully!")
    
except User.DoesNotExist:
    print("Error: Demo user 'demouser' not found. Please create this user first.")
except Exception as e:
    print(f"Error: {str(e)}") 