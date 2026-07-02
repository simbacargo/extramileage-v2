from django.urls import path

from . import views as v

app_name = "api"

urlpatterns = [
    path("site/", v.SiteView.as_view()),
    path("home/", v.HomeView.as_view()),

    path("brands/", v.BrandList.as_view()),
    path("categories/", v.CategoryList.as_view()),
    path("countries/", v.CountryList.as_view()),

    path("cars/", v.CarList.as_view()),
    path("cars/<slug:slug>/", v.CarDetail.as_view()),

    path("products/", v.ProductList.as_view()),
    path("products/<slug:slug>/", v.ProductDetail.as_view()),

    path("auctions/", v.AuctionList.as_view()),
    path("auctions/<slug:slug>/", v.AuctionDetail.as_view()),
    path("auctions/<slug:slug>/bid/", v.place_bid),

    path("auth/register/", v.register),
    path("auth/login/", v.login),
    path("auth/me/", v.me),

    path("wishlist/", v.WishlistView.as_view()),
    path("wishlist/ids/", v.wishlist_ids),
    path("wishlist/toggle/", v.toggle_wishlist),

    path("inquiries/", v.create_inquiry),

    path("saved-searches/", v.SavedSearchList.as_view()),
    path("saved-searches/<int:pk>/", v.SavedSearchDetail.as_view()),
    path("saved-searches/<int:pk>/seen/", v.mark_search_seen),
]
