from django.urls import path
from .views import DashboardView,MemberRegisterView,MembersListView,TasksView, TaskDetail

urlpatterns = [
    path("", DashboardView.as_view(), name="dashboard"),
    path("members/", MembersListView.as_view(), name="members"),
    path('register/', MemberRegisterView.as_view(), name='register'),
    path('tasks/', TasksView.as_view(), name='tasks'),
    path('task_detail/<str:pk>/', TaskDetail.as_view(), name='task_detail'),
]
