from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.urls import reverse
from django.contrib.auth import get_user_model
from tasky.models import Task

User = get_user_model()

class TaskAPITests(APITestCase):

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(id = 1,username='testuser', password='testpassword123')
        self.client.force_authenticate(user=self.user)
        self.task = Task.objects.create(
            title='Test Task',
            description='Task Description',
            status='In Progress',
            priority='High',
            due_date='2024-12-31T23:59:59Z',
            category='Testing',
            assigned_to=self.user
        )
        self.list_url = reverse('task_list_api')
        self.detail_url = reverse('task_detail_api', kwargs={'pk': self.task.id})

    def test_list_tasks(self):
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('title', response.data[0])

    def test_create_task(self):
        data = {
            'title': 'New Task',
            'description': 'New Task Description',
            'status': 'In Progress',
            'priority': 'Medium',
            'due_date': '2024-12-31T23:59:59Z',
            'category': 'Testing',
            'assigned_to': self.user.pk
        }
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], 'New Task')

    def test_get_task_detail(self):
        response = self.client.get(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Test Task')

    def test_update_task(self):
        data = {
            'title': 'Updated Task',
            'description': 'Updated Task Description',
            'status': 'Completed',
            'priority': 'High',
            'due_date': '2024-12-31T23:59:59Z',
            'category': 'Testing',
            'assigned_to': self.user.id
        }
        response = self.client.put(self.detail_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Updated Task')

    def test_delete_task(self):
        response = self.client.delete(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Task.objects.filter(id=self.task.id).exists())




# from rest_framework.test import APITestCase, APIClient
# from rest_framework import status
# from django.urls import reverse
# from django.contrib.auth import get_user_model
# from tasky.models import Task

# User = get_user_model()

# class TaskAPITests(APITestCase):

#     def setUp(self):
#         self.client = APIClient()
#         self.user = User.objects.create_user(username='testuser', password='testpassword123')
#         self.client.force_authenticate(user=self.user)
#         self.task = Task.objects.create(
#             title='Test Task',
#             description='Task Description',
#             status='In Progress',
#             priority='High',
#             due_date='2024-12-31T23:59:59Z',
#             category='Testing',
#             assigned_to=self.user
#         )
#         self.list_url = reverse('task_list_api')
#         self.detail_url = reverse('task_detail_api', kwargs={'pk': self.task.id})

#     def test_list_tasks(self):
#         response = self.client.get(self.list_url)
#         self.assertEqual(response.status_code, status.HTTP_200_OK)
#         self.assertIn('title', response.data[0])

#     def test_create_task(self):
#         data = {
#             'title': 'New Task',
#             'description': 'New Task Description',
#             'status': 'In Progress',
#             'priority': 'Medium',
#             'due_date': '2024-12-31T23:59:59Z',
#             'category': 'Testing',
#             'assigned_to': 'testuser'  # Use the username of the user
#         }
#         response = self.client.post(self.list_url, data, format='json')
#         self.assertEqual(response.status_code, status.HTTP_201_CREATED)
#         self.assertEqual(response.data['title'], 'New Task')

#     def test_get_task_detail(self):
#         response = self.client.get(self.detail_url)
#         self.assertEqual(response.status_code, status.HTTP_200_OK)
#         self.assertEqual(response.data['title'], 'Test Task')

#     def test_update_task(self):
#         data = {
#             'title': 'Updated Task',
#             'description': 'Updated Task Description',
#             'status': 'Completed',
#             'priority': 'High',
#             'due_date': '2024-12-31T23:59:59Z',
#             'category': 'Testing',
#             'assigned_to': 'testuser'  # Use the username of the user
#         }
#         response = self.client.put(self.detail_url, data, format='json')
#         self.assertEqual(response.status_code, status.HTTP_200_OK)
#         self.assertEqual(response.data['title'], 'Updated Task')

#     def test_delete_task(self):
#         response = self.client.delete(self.detail_url)
#         self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
#         self.assertFalse(Task.objects.filter(id=self.task.id).exists())
