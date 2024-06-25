from rest_framework import generics
from tasky.models import Task
from .serializers import TaskSerializer
from rest_framework.permissions import IsAuthenticated
    


from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from tasky.models import Task
from .serializers import TaskSerializer

class TaskList(generics.ListCreateAPIView):
    """
    API endpoint that allows listing and creation of tasks.

    This view allows authenticated users to:
    - List all tasks.
    - Create a new task.

    Only authenticated users are permitted to access this view.

    Methods:
    - GET: Retrieves a list of tasks.
    - POST: Creates a new task.

    Serializer Class: TaskSerializer
    """
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

class TaskDetail(generics.RetrieveUpdateDestroyAPIView):
    """
    API endpoint that allows retrieving, updating, and deleting a task.

    This view allows authenticated users to:
    - Retrieve details of a specific task.
    - Update an existing task.
    - Delete an existing task.

    Only authenticated users are permitted to access this view.

    Methods:
    - GET: Retrieves details of a specific task.
    - PUT: Updates an existing task.
    - PATCH: Partially updates an existing task.
    - DELETE: Deletes an existing task.

    Serializer Class: TaskSerializer
    """
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]
