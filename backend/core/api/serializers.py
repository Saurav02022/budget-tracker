from rest_framework import serializers
from django.contrib.auth.models import User
from core.models import Category, Transaction, Budget

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email')

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ('id', 'name', 'type')
        read_only_fields = ('id',)
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class TransactionSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    
    class Meta:
        model = Transaction
        fields = ('id', 'amount', 'type', 'description', 'date', 'category', 'category_name', 'created_at')
        read_only_fields = ('id', 'created_at')
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
    
    def validate(self, data):
        # Check if the category belongs to the user
        if 'category' in data:
            category = data['category']
            user = self.context['request'].user
            if category.user.id != user.id:
                raise serializers.ValidationError({"category": "You can only use your own categories."})
            
            # Ensure transaction type matches category type
            if data.get('type') != category.type:
                raise serializers.ValidationError({
                    "type": f"Transaction type must match category type. Got {data.get('type')} transaction with {category.type} category."
                })
        
        return data

class BudgetSerializer(serializers.ModelSerializer):
    month_display = serializers.SerializerMethodField()
    
    class Meta:
        model = Budget
        fields = ('id', 'month', 'month_display', 'amount')
        read_only_fields = ('id',)
    
    def get_month_display(self, obj):
        return obj.month.strftime('%B %Y')
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class TransactionSummarySerializer(serializers.Serializer):
    total_income = serializers.DecimalField(max_digits=10, decimal_places=2)
    total_expenses = serializers.DecimalField(max_digits=10, decimal_places=2)
    balance = serializers.DecimalField(max_digits=10, decimal_places=2)
    
class CategoryBreakdownSerializer(serializers.Serializer):
    category_id = serializers.IntegerField()
    category_name = serializers.CharField()
    category_type = serializers.CharField()
    total_amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    percentage = serializers.DecimalField(max_digits=5, decimal_places=2) 