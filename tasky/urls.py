from django.urls import path
from .views import MemberRegisterView,MembersListView

urlpatterns = [
    path("members/", MembersListView.as_view(), name="members"),
    path('register/', MemberRegisterView.as_view(), name='register'),
]
