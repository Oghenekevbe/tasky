import pytest
from django.urls import reverse
from django.test import RequestFactory
from django.contrib.auth import get_user_model
from django.contrib.sessions.middleware import SessionMiddleware
from mixer.backend.django import mixer  # Optional, for generating model instances easily
from .forms import UserCreationForm, LoginForm  # Adjust this import as per your project structure
from .views import MemberLoginView, MemberLogoutView, MemberRegisterView, DashboardView

User = get_user_model()

@pytest.mark.django_db
class TestMemberRegisterView:

    def test_member_register_view(self):
        url = reverse('register')
        request = RequestFactory().get(url)
        response = MemberRegisterView.as_view()(request)
        
        assert response.status_code == 200  # Check if the registration page renders successfully

        # Simulate a post request for form submission
        data = {
            'username': 'testuser',
            'password1': 'testpassword',
            'password2': 'testpassword',
        }
        request = RequestFactory().post(url, data)
        response = MemberRegisterView.as_view()(request)
        
        assert response.status_code == 302  # Check if registration redirects to login page upon success


@pytest.mark.django_db
class TestMemberLoginView:

    def test_member_login_view(self):
        # Create a user for testing
        user = mixer.blend(User)
        url = reverse('login')
        request = RequestFactory().get(url)
        response = MemberLoginView.as_view()(request)
        
        assert response.status_code == 200  # Check if the login page renders successfully

        # Simulate a post request for form submission
        data = {
            'username': user.username,
            'password': 'testpassword',
        }
        request = RequestFactory().post(url, data)
        response = MemberLoginView.as_view()(request)
        
        assert response.status_code == 302  # Check if login redirects to dashboard upon successful authentication


@pytest.mark.django_db
class TestMemberLogoutView:

    def test_member_logout_view(self):
        url = reverse('logout')
        request = RequestFactory().get(url)
        middleware = SessionMiddleware()
        middleware.process_request(request)
        request.session.save()

        # Simulate a logged in user
        request.user = mixer.blend(User)
        response = MemberLogoutView.as_view()(request)
        
        assert response.status_code == 302  # Check if logout redirects to login page


@pytest.mark.django_db
class TestDashboardView:

    def test_dashboard_view(self):
        # Create a logged in user
        user = mixer.blend(User)
        url = reverse('dashboard')
        request = RequestFactory().get(url)
        request.user = user
        
        # Set session data for JWT tokens
        request.session['jwt_access_token'] = 'fake_access_token'
        request.session['jwt_refresh_token'] = 'fake_refresh_token'
        
        response = DashboardView.as_view()(request)
        
        assert response.status_code == 200  # Check if dashboard page renders successfully
        assert 'form' in response.context_data  # Check if form is included in context
        assert response.context_data['jwt_access_token'] == 'fake_access_token'
        assert response.context_data['jwt_refresh_token'] == 'fake_refresh_token'
