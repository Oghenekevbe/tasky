from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from tasky.models import Task
from .serializers import TaskSerializer
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

class TaskList(generics.ListCreateAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Retrieve a list of all tasks",
        responses={
            200: openapi.Response(description='List of tasks', schema=TaskSerializer(many=True)),
            401: openapi.Response(description='Unauthorized'),
            403: openapi.Response(description='Forbidden')
        }
    )
    def get(self, request, *args, **kwargs):
        """
        GET:
        - Description: Retrieve a list of all tasks.
        - Responses:
            - 200: List of tasks (TaskSerializer)
            - 401: Unauthorized
            - 403: Forbidden
        """
        return super().get(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_description="Create a new task",
        request_body=TaskSerializer,
        responses={
            201: openapi.Response(description='Task created', schema=TaskSerializer),
            400: openapi.Response(description='Bad Request'),
            401: openapi.Response(description='Unauthorized'),
            403: openapi.Response(description='Forbidden')
        }
    )
    def post(self, request, *args, **kwargs):
        """
        POST:
        - Description: Create a new task.
        - Request Body: TaskSerializer
        - Responses:
            - 201: Task created (TaskSerializer)
            - 400: Bad Request
            - 401: Unauthorized
            - 403: Forbidden
        """
        return super().post(request, *args, **kwargs)

class TaskDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Retrieve details of a specific task by ID",
        responses={
            200: openapi.Response(description='Task details', schema=TaskSerializer),
            401: openapi.Response(description='Unauthorized'),
            403: openapi.Response(description='Forbidden'),
            404: openapi.Response(description='Not Found')
        }
    )
    def get(self, request, *args, **kwargs):
        """
        GET:
        - Description: Retrieve details of a specific task by ID.
        - Responses:
            - 200: Task details (TaskSerializer)
            - 401: Unauthorized
            - 403: Forbidden
            - 404: Not Found
        """
        return super().get(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_description="Update an existing task by ID",
        request_body=TaskSerializer,
        responses={
            200: openapi.Response(description='Task updated', schema=TaskSerializer),
            400: openapi.Response(description='Bad Request'),
            401: openapi.Response(description='Unauthorized'),
            403: openapi.Response(description='Forbidden'),
            404: openapi.Response(description='Not Found')
        }
    )
    def put(self, request, *args, **kwargs):
        """
        PUT:
        - Description: Update an existing task by ID.
        - Request Body: TaskSerializer
        - Responses:
            - 200: Task updated (TaskSerializer)
            - 400: Bad Request
            - 401: Unauthorized
            - 403: Forbidden
            - 404: Not Found
        """
        return super().put(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_description="Delete an existing task by ID",
        responses={
            204: openapi.Response(description='Task deleted'),
            401: openapi.Response(description='Unauthorized'),
            403: openapi.Response(description='Forbidden'),
            404: openapi.Response(description='Not Found')
        }
    )
    def delete(self, request, *args, **kwargs):
        """
        DELETE:
        - Description: Delete an existing task by ID.
        - Responses:
            - 204: Task deleted
            - 401: Unauthorized
            - 403: Forbidden
            - 404: Not Found
        """
        return super().delete(request, *args, **kwargs)
