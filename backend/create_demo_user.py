import os
import django

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'budget_tracker.settings')
django.setup()

from django.contrib.auth.models import User

# Create demo user if doesn't exist
try:
    user, created = User.objects.get_or_create(
        username='demouser',
        defaults={
            'email': 'demo@example.com',
            'is_active': True
        }
    )
    
    if created:
        user.set_password('demopassword')
        user.save()
        print("Demo user created successfully!")
    else:
        print("Demo user already exists.")
        
    print(f"Username: demouser")
    print(f"Password: demopassword")
    
except Exception as e:
    print(f"Error creating demo user: {str(e)}") 