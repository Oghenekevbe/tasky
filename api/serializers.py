from rest_framework import serializers
from django.contrib.auth import get_user_model
from tasky.models import Task

User = get_user_model()



class TaskSerializer(serializers.ModelSerializer):
    assigned_to = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())

    class Meta:
        model = Task
        fields = '__all__'
