from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth import get_user_model
from .models import Task

User = get_user_model()

class MemberRegisterViewTests(TestCase):

    def setUp(self):
        self.client = Client()
        self.register_url = reverse('register')

    def test_register_view_get(self):
        response = self.client.get(self.register_url)
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'registration/register.html')

    def test_register_view_post(self):
        data = {
            'username': 'testuser',
            'password1': 'testpassword123',
            'password2': 'testpassword123'
        }
        response = self.client.post(self.register_url, data)
        self.assertEqual(response.status_code, 302)
        self.assertTrue(User.objects.filter(username='testuser').exists())


class MemberLoginViewTests(TestCase):

    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(username='testuser', password='testpassword123')
        self.login_url = reverse('login')

    def test_login_view_get(self):
        response = self.client.get(self.login_url)
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'registration/login.html')

    def test_login_view_post(self):
        data = {
            'username': 'testuser',
            'password': 'testpassword123'
        }
        response = self.client.post(self.login_url, data)
        self.assertEqual(response.status_code, 302)
        self.assertRedirects(response, reverse('dashboard'))


class MembersListViewTests(TestCase):

    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(username='testuser', password='testpassword123')
        self.client.login(username='testuser', password='testpassword123')
        self.members_url = reverse('members')

    def test_members_list_view(self):
        response = self.client.get(self.members_url)
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'members.html')


class MemberLogoutViewTests(TestCase):

    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(username='testuser', password='testpassword123')
        self.client.login(username='testuser', password='testpassword123')
        self.logout_url = reverse('logout')

    def test_logout_view(self):
        response = self.client.get(self.logout_url)
        self.assertEqual(response.status_code, 302)
        self.assertRedirects(response, reverse('login'))


class ChangePasswordTests(TestCase):

    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(username='testuser', password='testpassword123')
        self.client.login(username='testuser', password='testpassword123')
        self.change_password_url = reverse('change_password')

    def test_change_password_view_get(self):
        response = self.client.get(self.change_password_url)
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'registration/change_password.html')

    def test_change_password_view_post(self):
        data = {
            'old_password': 'testpassword123',
            'new_password1': 'newtestpassword123',
            'new_password2': 'newtestpassword123'
        }
        response = self.client.post(self.change_password_url, data)
        self.assertEqual(response.status_code, 302)
        self.assertRedirects(response, reverse('dashboard'))


class TasksViewTests(TestCase):

    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(username='testuser', password='testpassword123')
        self.client.login(username='testuser', password='testpassword123')
        self.tasks_url = reverse('tasks')
        Task.objects.create(title='Test Task', description='Task Description', status='In Progress', priority='High', due_date='2024-12-31', category='Testing', assigned_to=self.user)

    def test_tasks_view(self):
        response = self.client.get(self.tasks_url)
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'tasks.html')
        self.assertContains(response, 'Test Task')


class TaskDetailViewTests(TestCase):

    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(username='testuser', password='testpassword123')
        self.client.login(username='testuser', password='testpassword123')
        self.task = Task.objects.create(title='Test Task', description='Task Description', status='In Progress', priority='High', due_date='2024-12-31', category='Testing', assigned_to=self.user)
        self.task_detail_url = reverse('task_detail', args=[self.task.id])

    def test_task_detail_view(self):
        response = self.client.get(self.task_detail_url)
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'task_detail.html')
        self.assertContains(response, 'Test Task')


class DashboardViewTests(TestCase):

    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(username='testuser', password='testpassword123')
        self.client.login(username='testuser', password='testpassword123')
        self.dashboard_url = reverse('dashboard')

    def test_dashboard_view(self):
        response = self.client.get(self.dashboard_url)
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'dashboard.html')
        self.assertIn('form', response.context)
        self.assertIn('jwt_access_token', response.context)
        self.assertIn('jwt_refresh_token', response.context)


class WelcomeScreenTests(TestCase):

    def setUp(self):
        self.client = Client()
        self.welcome_url = reverse('welcome')

    def test_welcome_screen_view(self):
        response = self.client.get(self.welcome_url)
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'welcome.html')
