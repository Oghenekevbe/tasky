from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from tasky.models import Task
from .serializers import TaskSerializer
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi



from rest_framework import generics
from tasky.models import Task
from .serializers import TaskSerializer

class TaskList(generics.ListCreateAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer

class TaskDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer