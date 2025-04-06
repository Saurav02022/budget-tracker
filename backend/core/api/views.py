from django.db.models import Sum, F, Case, When, DecimalField, Value
from django.utils import timezone
from django.db.models.functions import TruncMonth
from decimal import Decimal

from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend

from core.models import Category, Transaction, Budget
from .serializers import (
    CategorySerializer, TransactionSerializer, BudgetSerializer,
    TransactionSummarySerializer, CategoryBreakdownSerializer
)

class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']
    
    def get_queryset(self):
        return Category.objects.filter(user=self.request.user).order_by('name')
    
    @action(detail=False, methods=['get'])
    def income(self, request):
        queryset = self.get_queryset().filter(type='income')
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def expense(self, request):
        queryset = self.get_queryset().filter(type='expense')
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

class TransactionViewSet(viewsets.ModelViewSet):
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['type', 'category', 'date']
    search_fields = ['description', 'category__name']
    ordering_fields = ['date', 'amount', 'category__name']
    ordering = ['-date']
    
    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def summary(self, request):
        user = request.user
        
        # Get query parameters for date filtering
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        # Filter transactions based on date range if provided
        queryset = Transaction.objects.filter(user=user)
        if start_date:
            queryset = queryset.filter(date__gte=start_date)
        if end_date:
            queryset = queryset.filter(date__lte=end_date)
        
        # Calculate total income and expenses
        summary = queryset.aggregate(
            total_income=Sum(
                Case(
                    When(type='income', then=F('amount')),
                    default=Value(0),
                    output_field=DecimalField()
                )
            ),
            total_expenses=Sum(
                Case(
                    When(type='expense', then=F('amount')),
                    default=Value(0),
                    output_field=DecimalField()
                )
            )
        )
        
        # Set default values if None
        total_income = summary.get('total_income') or Decimal('0')
        total_expenses = summary.get('total_expenses') or Decimal('0')
        balance = total_income - total_expenses
        
        data = {
            'total_income': total_income,
            'total_expenses': total_expenses,
            'balance': balance
        }
        
        serializer = TransactionSummarySerializer(data)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def category_breakdown(self, request):
        user = request.user
        transaction_type = request.query_params.get('type', 'expense')
        
        # Get query parameters for date filtering
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        # Filter transactions based on date range if provided
        queryset = Transaction.objects.filter(user=user, type=transaction_type)
        if start_date:
            queryset = queryset.filter(date__gte=start_date)
        if end_date:
            queryset = queryset.filter(date__lte=end_date)
        
        # Get total amount for the transaction type
        total = queryset.aggregate(total=Sum('amount'))['total'] or Decimal('0')
        
        # Get breakdown by category
        breakdown = queryset.values(
            'category', 
            category_name=F('category__name'),
            category_type=F('category__type')
        ).annotate(
            total_amount=Sum('amount')
        ).order_by('-total_amount')
        
        # Calculate percentage for each category
        result = []
        for item in breakdown:
            percentage = (item['total_amount'] / total * 100) if total > 0 else Decimal('0')
            result.append({
                'category_id': item['category'],
                'category_name': item['category_name'],
                'category_type': item['category_type'],
                'total_amount': item['total_amount'],
                'percentage': round(percentage, 2)
            })
        
        serializer = CategoryBreakdownSerializer(result, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def monthly(self, request):
        user = request.user
        
        # Get month data for the last 12 months
        today = timezone.now().date()
        
        # Aggregate data by month
        monthly_data = Transaction.objects.filter(
            user=user,
            date__year=today.year
        ).annotate(
            month=TruncMonth('date')
        ).values('month', 'type').annotate(
            total=Sum('amount')
        ).order_by('month', 'type')
        
        # Format the data for easy consumption by frontend charts
        result = {}
        for entry in monthly_data:
            month_key = entry['month'].strftime('%Y-%m')
            if month_key not in result:
                result[month_key] = {
                    'month': entry['month'].strftime('%b %Y'),
                    'income': Decimal('0'),
                    'expense': Decimal('0')
                }
            result[month_key][entry['type']] = entry['total']
        
        return Response(list(result.values()))

class BudgetViewSet(viewsets.ModelViewSet):
    serializer_class = BudgetSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Budget.objects.filter(user=self.request.user).order_by('-month')
    
    def create(self, request, *args, **kwargs):
        # Extract data from request
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Check if budget already exists for this month
        month = serializer.validated_data.get('month')
        user = request.user
        
        try:
            # If budget exists, update it
            existing_budget = Budget.objects.get(user=user, month=month)
            
            # Update the amount
            existing_budget.amount = serializer.validated_data.get('amount')
            existing_budget.save()
            
            # Serialize the updated budget
            result_serializer = self.get_serializer(existing_budget)
            return Response(result_serializer.data, status=status.HTTP_200_OK)
            
        except Budget.DoesNotExist:
            # If budget doesn't exist, create a new one
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
    
    @action(detail=False, methods=['get'])
    def current(self, request):
        user = request.user
        today = timezone.now().date()
        current_month = today.replace(day=1)
        
        # Try to get the budget for the current month
        try:
            budget = Budget.objects.get(user=user, month=current_month)
            serializer = self.get_serializer(budget)
            data = serializer.data
        except Budget.DoesNotExist:
            # If no budget exists for the current month
            data = {'month': current_month, 'amount': '0.00', 'month_display': current_month.strftime('%B %Y')}
        
        # Get total expenses for the current month
        expenses = Transaction.objects.filter(
            user=user,
            type='expense',
            date__year=today.year,
            date__month=today.month
        ).aggregate(total=Sum('amount'))
        
        total_expenses = expenses['total'] or Decimal('0')
        
        # Add expense data to the response
        data['spent'] = str(total_expenses)
        
        # Calculate remaining budget
        budget_amount = Decimal(data['amount'])
        data['remaining'] = str(budget_amount - total_expenses)
        
        # Calculate percentage of budget spent
        if budget_amount > 0:
            data['percentage_spent'] = round((total_expenses / budget_amount) * 100, 2)
        else:
            data['percentage_spent'] = 0.0
        
        return Response(data) 