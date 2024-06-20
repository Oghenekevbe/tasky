from django.shortcuts import render
from django.contrib.auth import get_user_model
from django.urls import reverse_lazy
from django.views.generic import CreateView,ListView
from .forms import UserCreationForm

User = get_user_model()


class MemberRegisterView(CreateView):
    form_class = UserCreationForm
    template_name = 'registration/register.html'
    success_url = reverse_lazy('login')

class MembersListView(ListView):
    model = User
    template_name = 'members.html' 
    context_object_name = 'members'



