from rest_framework import serializers
from tasky.models import Task


class TaskSerializer(serializers.ModelSerializer):
    assigned_to = serializers.CharField(source='assigned_to.username', read_only=True)
    class Meta:
        model = Task
        fields = '__all__'