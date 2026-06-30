from django import forms
from django.contrib.auth.forms import UserCreationForm

from .models import User


class RegisterForm(UserCreationForm):
    first_name = forms.CharField(max_length=60, required=True)
    last_name = forms.CharField(max_length=60, required=False)
    email = forms.EmailField(required=True)
    country = forms.CharField(max_length=80, required=False)
    phone = forms.CharField(max_length=40, required=False)

    class Meta:
        model = User
        fields = ("first_name", "last_name", "email", "username", "country", "phone", "password1", "password2")

    def save(self, commit=True):
        user = super().save(commit=False)
        user.email = self.cleaned_data["email"]
        user.first_name = self.cleaned_data["first_name"]
        user.last_name = self.cleaned_data.get("last_name", "")
        user.country = self.cleaned_data.get("country", "")
        user.phone = self.cleaned_data.get("phone", "")
        if commit:
            user.save()
        return user


class ProfileForm(forms.ModelForm):
    class Meta:
        model = User
        fields = ("first_name", "last_name", "email", "phone", "country", "avatar")
