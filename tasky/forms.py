from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth import get_user_model
from .models import Task


User = get_user_model()


class UserCreationForm(UserCreationForm):
    first_name = forms.CharField(max_length=30, required=False)
    last_name = forms.CharField(max_length=30, required=False)
    email = forms.EmailField(max_length=254, required=True)

    class Meta:
        model = User
        fields = ('username', 'first_name', 'last_name', 'email', 'password1', 'password2')


class TaskForm(forms.ModelForm):
    due_date = forms.DateTimeField(widget=forms.TextInput(attrs={'class': 'datetimepicker', 'id': 'id_due_date'}))
    title = forms.CharField(widget=forms.TextInput(attrs={'id': 'title'}))
    description = forms.CharField(widget=forms.Textarea(attrs={'id': 'description'}))
    status = forms.ChoiceField(choices=[('In Progress', 'In Progress'),
        ('Completed', 'Completed'),
        ('Overdue', 'Overdue'),], widget=forms.Select(attrs={'id': 'status'}))
    priority = forms.ChoiceField(choices=[('Low', 'Low'), ('Medium', 'Medium'), ('High', 'High')], widget=forms.Select(attrs={'id': 'priority'}))
    category = forms.CharField(widget=forms.TextInput(attrs={'id': 'category'}))
    assigned_to = forms.ModelChoiceField(queryset=User.objects.all(), widget=forms.Select(attrs={'id': 'assigned_to'}))

    class Meta:
        model = Task
        fields = ['title', 'description', 'due_date','status' , 'priority', 'category', 'assigned_to']