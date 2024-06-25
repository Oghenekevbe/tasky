from django.contrib.auth import get_user_model, authenticate, login, logout, update_session_auth_hash
from django.contrib.auth.views import LoginView, LogoutView, PasswordChangeView
from django.shortcuts import render, redirect
from django.urls import reverse_lazy
from django.views.generic import CreateView, ListView, TemplateView, DetailView, View
from django.contrib.auth.forms import PasswordChangeForm
from django.contrib import messages
from django.contrib.auth.mixins import LoginRequiredMixin
from .forms import UserCreationForm, TaskForm, LoginForm
from .models import Task
from .tokens import get_tokens_for_user


User = get_user_model()


class MemberRegisterView(CreateView):
    """
    View for registering new members.

    Allows new users to register using UserCreationForm.
    Upon successful registration, redirects to the login page.
    """
    form_class = UserCreationForm
    template_name = 'registration/register.html'
    success_url = reverse_lazy('login')


class MemberLoginView(LoginView):
    """
    View for member login.

    Renders login form and processes login credentials.
    Authenticates user upon form submission and generates JWT tokens.
    Sets cookies and stores tokens in session upon successful login.
    """
    template_name = 'registration/login.html'
    form_class = LoginForm

    def get(self, request, *args, **kwargs):
        """
        Handles GET requests to display the login form.
        """
        form = self.form_class()
        return render(request, self.template_name, {'form': form})

    def post(self, request, *args, **kwargs):
        """
        Handles POST requests to process login credentials.
        """
        form = self.form_class(data=request.POST)
        if form.is_valid():
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')
            user = authenticate(request, username=username, password=password)

            if user is not None:
                login(request, user)

                # Generate tokens using the function from tokens.py
                tokens = get_tokens_for_user(user)
                print(tokens)

                # Set cookies for JWT tokens
                response = redirect('dashboard')

                # Store tokens in Django session
                request.session['jwt_access_token'] = tokens['access']
                request.session['jwt_refresh_token'] = tokens['refresh']

                return response
        return render(request, self.template_name, {'form': form})


class MembersListView(LoginRequiredMixin, ListView):
    """
    View for listing all members.

    Requires login and displays a list of all registered members.
    """
    model = User
    template_name = 'members.html'
    context_object_name = 'members'


class MemberLogoutView(LogoutView):
    """
    View for member logout.

    Logs out the authenticated user and redirects to the login page.
    """
    def get(self, request):
        logout(request)
        return redirect('login')


class ChangePassword(LoginRequiredMixin, PasswordChangeView):
    """
    View for changing the user's password.

    Requires login and provides a form to change the password.
    Updates the session with the new authentication hash after successful password change.
    """
    template_name = 'registration/change_password.html'
    form_class = PasswordChangeForm
    success_url = reverse_lazy('dashboard')  # Replace with your success URL


class TasksView(LoginRequiredMixin, TemplateView):
    """
    View for displaying tasks.

    Requires login and displays all tasks using tasks.html template.
    """
    template_name = 'tasks.html'

    def get_context_data(self, **kwargs):
        """
        Adds all tasks to the context for rendering in the template.
        """
        context = super().get_context_data(**kwargs)
        context['tasks'] = Task.objects.all()  # Queryset of all tasks
        return context


class TaskDetail(LoginRequiredMixin, DetailView):
    """
    View for displaying details of a specific task.

    Requires login and displays details of a single Task instance.
    """
    template_name = 'task_detail.html'
    model = Task
    context_object_name = 'task'


class DashboardView(LoginRequiredMixin, TemplateView):
    """
    View for displaying the dashboard.

    Requires login and displays the dashboard.html template.
    Includes a TaskForm instance in the context for creating new tasks.
    Retrieves and includes JWT tokens from session in the context.
    """
    template_name = 'dashboard.html'
    form_class = TaskForm

    def get_context_data(self, **kwargs):
        """
        Adds TaskForm and JWT tokens to the context for rendering in the template.
        """
        context = super().get_context_data(**kwargs)
        context['form'] = self.form_class()

        # Retrieve JWT tokens from session
        jwt_access_token = self.request.session.get('jwt_access_token')
        jwt_refresh_token = self.request.session.get('jwt_refresh_token')

        # Add tokens to context
        context['jwt_access_token'] = jwt_access_token
        context['jwt_refresh_token'] = jwt_refresh_token

        return context


class WelcomeScreen(TemplateView):
    """
    View for displaying the welcome screen if the user is not authenticated.

    Displays the welcome.html template.
    """
    template_name = 'welcome.html'
