from django.urls import path
from .views import DashboardView,MemberRegisterView,MembersListView,TasksView, TaskDetail,WelcomeScreen,MemberLoginView,ChangePassword,MemberLogoutView

urlpatterns = [
    path("", DashboardView.as_view(), name="dashboard"),
    path("members/", MembersListView.as_view(), name="members"),
    path('tasks/', TasksView.as_view(), name='tasks'),
    path('task_detail/<str:pk>/', TaskDetail.as_view(), name='task_detail'),



    path('welcome/', WelcomeScreen.as_view(), name='welcome'),
    path('register/', MemberRegisterView.as_view(), name='register'),
    path('login/', MemberLoginView.as_view(), name='login'),
    path('change_password/', ChangePassword.as_view(), name='change_password'),
    path('logout/', MemberLogoutView.as_view(http_method_names = ['get', 'post', 'options']), name='logout'),

]
