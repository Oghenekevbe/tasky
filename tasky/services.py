from django.shortcuts import render,redirect
from django.contrib.auth.mixins import UserPassesTestMixin

# Create your views here.

class LoginRequiredMixin(UserPassesTestMixin):
    def test_func(self):
        return self.request.user.is_authenticated

    def handle_no_permission(self):
        return redirect('welcome')
