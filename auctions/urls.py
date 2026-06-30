from django.urls import path

from . import views

app_name = "auctions"

urlpatterns = [
    path("", views.auction_list, name="list"),
    path("<slug:slug>/", views.auction_detail, name="detail"),
    path("<slug:slug>/bid/", views.place_bid, name="bid"),
    path("<slug:slug>/status/", views.auction_status, name="status"),
]
