from django.contrib import messages
from django.db.models import Count, Q
from django.shortcuts import redirect, render
from django.utils import timezone

from accounts.models import Inquiry
from auctions.models import Auction
from catalog.models import Brand, Car, Category
from django.shortcuts import get_object_or_404
from shop.models import Product

from .models import Slide, Testimonial


def home(request):
    cars = Car.objects.available().select_related("brand", "category", "origin_country").prefetch_related("images")
    ctx = {
        "slides": Slide.objects.filter(active=True),
        "featured_cars": cars.filter(featured=True)[:8],
        "new_arrivals": cars.order_by("-created")[:8],
        "popular_cars": cars.order_by("-views_count")[:8],
        "categories": (Category.objects.annotate(n=Count("cars", filter=Q(cars__status="available")))
                       .filter(n__gt=0).order_by("-n")),
        "brands": Brand.objects.order_by("name"),
        "featured_products": Product.objects.filter(status="available").prefetch_related("images")[:8],
        "live_auctions": Auction.objects.filter(end_date__gt=timezone.now()).prefetch_related("bids")[:6],
        "testimonials": Testimonial.objects.filter(active=True),
        "stats": {
            "total_cars": cars.count(),
            "total_brands": Brand.objects.count(),
            "total_products": Product.objects.count(),
            "countries_served": 120,
        },
    }
    return render(request, "core/home.html", ctx)


def about(request):
    return render(request, "core/about.html", {
        "stats": {
            "total_cars": Car.objects.available().count(),
            "total_brands": Brand.objects.count(),
            "years": 15,
            "countries_served": 120,
        },
    })


def contact(request):
    if request.method == "POST":
        car = None
        if car_id := request.POST.get("car_id"):
            car = Car.objects.filter(pk=car_id).first()
        Inquiry.objects.create(
            user=request.user if request.user.is_authenticated else None,
            name=request.POST.get("name", "").strip(),
            email=request.POST.get("email", "").strip(),
            phone=request.POST.get("phone", "").strip(),
            country=request.POST.get("country", "").strip(),
            subject=request.POST.get("subject", "").strip(),
            message=request.POST.get("message", "").strip(),
            car=car,
        )
        messages.success(request, "Thanks for reaching out — our team will reply within one business day.")
        return redirect("core:contact")
    return render(request, "core/contact.html")
