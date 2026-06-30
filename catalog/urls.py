from django.urls import path

from . import views

app_name = "catalog"

urlpatterns = [
    path("", views.car_list, name="car_list"),
    path("<slug:slug>/", views.car_detail, name="car_detail"),
]
