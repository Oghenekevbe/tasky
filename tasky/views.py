from django.shortcuts import render
from django.contrib.auth import get_user_model
from django.urls import reverse_lazy
from django.views.generic import CreateView,ListView,TemplateView
from .forms import UserCreationForm,TaskForm

User = get_user_model()


class MemberRegisterView(CreateView):
    form_class = UserCreationForm
    template_name = 'registration/register.html'
    success_url = reverse_lazy('login')

class MembersListView(ListView):
    model = User
    template_name = 'members.html' 
    context_object_name = 'members'

class TasksView(TemplateView):
    template_name = 'tasks.html' 


class DashboardView(TemplateView):
    template_name = 'dashboard.html'
    form_class = TaskForm

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['form'] = self.form_class()
        return context