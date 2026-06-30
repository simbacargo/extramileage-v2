from django.contrib import messages
from django.contrib.auth import login
from django.contrib.auth.decorators import login_required
from django.http import HttpResponseBadRequest
from django.shortcuts import get_object_or_404, redirect, render
from django.views.decorators.http import require_POST

from catalog.models import Car
from shop.models import Product

from .forms import ProfileForm, RegisterForm
from .models import Wishlist


def register(request):
    if request.user.is_authenticated:
        return redirect("accounts:dashboard")
    form = RegisterForm(request.POST or None)
    if request.method == "POST" and form.is_valid():
        user = form.save()
        login(request, user)
        messages.success(request, f"Welcome aboard, {user.display_name}!")
        return redirect("accounts:dashboard")
    return render(request, "accounts/register.html", {"form": form})


@login_required
def dashboard(request):
    user = request.user
    saved_cars = user.wishlist_items.filter(car__isnull=False).select_related("car__brand").prefetch_related("car__images")
    saved_products = user.wishlist_items.filter(product__isnull=False).prefetch_related("product__images")
    ctx = {
        "saved_cars": saved_cars[:6],
        "saved_products": saved_products[:6],
        "saved_cars_count": saved_cars.count(),
        "saved_products_count": saved_products.count(),
        "inquiries": user.inquiries.all()[:5],
        "bids": user.bids.select_related("auction")[:5],
    }
    return render(request, "accounts/dashboard.html", ctx)


@login_required
def wishlist(request):
    items = request.user.wishlist_items.select_related("car__brand", "product__brand").prefetch_related(
        "car__images", "product__images")
    return render(request, "accounts/wishlist.html", {"items": items})


@login_required
def profile(request):
    form = ProfileForm(request.POST or None, request.FILES or None, instance=request.user)
    if request.method == "POST" and form.is_valid():
        form.save()
        messages.success(request, "Profile updated.")
        return redirect("accounts:profile")
    return render(request, "accounts/profile.html", {"form": form})


@login_required
@require_POST
def toggle_wishlist(request):
    kind = request.POST.get("kind")
    obj_id = request.POST.get("id")
    if kind == "car":
        obj = get_object_or_404(Car, pk=obj_id)
        item = Wishlist.objects.filter(user=request.user, car=obj).first()
        if item:
            item.delete()
            active = False
        else:
            Wishlist.objects.create(user=request.user, car=obj)
            active = True
    elif kind == "product":
        obj = get_object_or_404(Product, pk=obj_id)
        item = Wishlist.objects.filter(user=request.user, product=obj).first()
        if item:
            item.delete()
            active = False
        else:
            Wishlist.objects.create(user=request.user, product=obj)
            active = True
    else:
        return HttpResponseBadRequest("invalid kind")

    return render(request, "accounts/_wishlist_button.html", {
        "active": active, "kind": kind, "obj_id": obj_id,
        "count": request.user.wishlist_items.count(),
    })
