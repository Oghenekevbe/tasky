from django.urls import path
from .views import TaskList, TaskDetail

urlpatterns = [

    path('tasks/', TaskList.as_view(), name='task_list_api'),
    path('tasks/<int:pk>/', TaskDetail.as_view(), name='task_detail_api'),
]
