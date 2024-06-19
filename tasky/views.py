from django.shortcuts import render
from django.contrib.auth import get_user_model
from django.views.generic import ListView

User = get_user_model()


class Members(ListView):
    model = User
    template_name = 'members.html' 
    context_object_name = 'members'



