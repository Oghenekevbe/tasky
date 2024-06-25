from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth import get_user_model
from .models import Task
from django.contrib.auth.forms import PasswordChangeForm as DjangoPasswordChangeForm
from django.utils.translation import gettext_lazy as _



User = get_user_model()


class UserCreationForm(UserCreationForm):
    username = forms.CharField(
        max_length=255, 
        widget=forms.TextInput(attrs={'class': 'form-control'}),
        required=True,
    )
    password1 = forms.CharField(
        label="Password",  # Custom label
        max_length=255, 
        widget=forms.PasswordInput(attrs={'class': 'form-control', 'type': 'password'}),
        required=True,
    )
    password2 = forms.CharField(
        label="Confirm Password",  # Custom label
        max_length=255, 
        widget=forms.PasswordInput(attrs={'class': 'form-control', 'type': 'password'}),
        required=True,
    )
    
    class Meta:
        model = User
        fields = ('username', 'password1', 'password2')

        from django.contrib.auth.forms import PasswordChangeForm as DjangoPasswordChangeForm
from django.utils.translation import gettext_lazy as _


class PasswordChangeForm(DjangoPasswordChangeForm):
    error_messages = {
        'password_incorrect': _("Your old password was entered incorrectly. Please enter it again."),
        'password_mismatch': _("The two password fields didn't match."),
    }

    old_password = forms.CharField(
        label=_("Old password"),
        strip=False,
        widget=forms.PasswordInput(attrs={'autocomplete': 'current-password', 'autofocus': True}),
    )
    new_password1 = forms.CharField(
        label=_("New password"),
        widget=forms.PasswordInput(attrs={'autocomplete': 'new-password'}),
        strip=False,
        help_text=_("Enter a strong password."),
    )
    new_password2 = forms.CharField(
        label=_("New password confirmation"),
        strip=False,
        widget=forms.PasswordInput(attrs={'autocomplete': 'new-password'}),
    )

    def __init__(self, user, *args, **kwargs):
        self.user = user
        super().__init__(user, *args, **kwargs)

    def clean_old_password(self):
        old_password = self.cleaned_data["old_password"]
        if not self.user.check_password(old_password):
            raise forms.ValidationError(
                self.error_messages['password_incorrect'],
                code='password_incorrect',
            )
        return old_password

    def clean_new_password2(self):
        new_password1 = self.cleaned_data.get('new_password1')
        new_password2 = self.cleaned_data.get('new_password2')
        if new_password1 and new_password2:
            if new_password1 != new_password2:
                raise forms.ValidationError(
                    self.error_messages['password_mismatch'],
                    code='password_mismatch',
                )
        return new_password2
        
class LoginForm(forms.Form):
    username = forms.CharField(max_length=255, widget= forms.TextInput(attrs={'class':'form-control'}),required=True,)
    password = forms.CharField(max_length=255, widget= forms.PasswordInput(attrs={'class':'form-control', 'type': 'password'}),required=True,)
    
    class Meta:
        model = User
        fields = ('username', 'password')  
         




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