from django.core.paginator import Paginator
from django.db.models import Q
from django.shortcuts import get_object_or_404, render

from .models import Brand, Car, Category, Country

SORTS = {
    "newest": "-created",
    "price_low": "price",
    "price_high": "-price",
    "year_new": "-year",
    "mileage_low": "mileage",
    "popular": "-views_count",
}


def _filtered_cars(request):
    qs = Car.objects.available().select_related("brand", "category", "origin_country").prefetch_related("images")
    g = request.GET

    if q := g.get("q", "").strip():
        qs = qs.filter(Q(make__icontains=q) | Q(model__icontains=q) | Q(stock_id__icontains=q) | Q(description__icontains=q))
    if brand := g.get("brand", "").strip():
        qs = qs.filter(brand__slug=brand)
    if category := g.get("category", "").strip():
        qs = qs.filter(category__slug=category)
    if fuel := g.get("fuel", "").strip():
        qs = qs.filter(fuel_type=fuel)
    if transmission := g.get("transmission", "").strip():
        qs = qs.filter(transmission=transmission)
    if condition := g.get("condition", "").strip():
        qs = qs.filter(condition=condition)
    if steering := g.get("steering", "").strip():
        qs = qs.filter(steering=steering)
    for field, lookup in [("year_min", "year__gte"), ("year_max", "year__lte"),
                          ("price_min", "price__gte"), ("price_max", "price__lte")]:
        val = g.get(field, "").strip()
        if val.isdigit():
            qs = qs.filter(**{lookup: int(val)})

    sort = g.get("sort", "newest")
    return qs.order_by(SORTS.get(sort, "-created"))


def car_list(request):
    qs = _filtered_cars(request)
    paginator = Paginator(qs, 12)
    page = paginator.get_page(request.GET.get("page"))

    params = request.GET.copy()
    params.pop("page", None)

    ctx = {
        "page_obj": page,
        "total": paginator.count,
        "brands": Brand.objects.order_by("name"),
        "categories": Category.objects.all(),
        "countries": Country.objects.all(),
        "fuels": Car.FUEL,
        "transmissions": Car.TRANSMISSION,
        "conditions": Car.CONDITION,
        "querystring": params.urlencode(),
        "current": request.GET,
    }
    # Filter/pagination requests get just the results grid; boosted full-page
    # navigations (which also send HX-Request) fall through to the whole page.
    if request.headers.get("HX-Request") and not request.headers.get("HX-Boosted"):
        return render(request, "catalog/_car_results.html", ctx)
    return render(request, "catalog/car_list.html", ctx)


def car_detail(request, slug):
    car = get_object_or_404(
        Car.objects.select_related("brand", "category", "origin_country").prefetch_related("images"),
        slug=slug,
    )
    Car.objects.filter(pk=car.pk).update(views_count=car.views_count + 1)

    related = (Car.objects.available().filter(category=car.category).exclude(pk=car.pk)
               .select_related("brand").prefetch_related("images")[:4])
    in_wishlist = False
    if request.user.is_authenticated:
        in_wishlist = request.user.wishlist_items.filter(car=car).exists()

    spec_rows = [
        ("Stock ID", car.stock_id),
        ("Make", car.make),
        ("Model", car.model),
        ("Year", car.year),
        ("Mileage", f"{car.mileage:,} km"),
        ("Engine", f"{car.engine_cc} cc" if car.engine_cc else "—"),
        ("Transmission", car.transmission),
        ("Fuel", car.fuel_type),
        ("Drivetrain", car.drivetrain),
        ("Steering", car.get_steering_display()),
        ("Doors / Seats", f"{car.doors} / {car.seats}"),
        ("Color", car.color or "—"),
        ("Condition", car.get_condition_display()),
        ("Location", car.location),
        ("Origin", car.origin_country.name if car.origin_country else "Japan"),
    ]

    return render(request, "catalog/car_detail.html", {
        "car": car,
        "related": related,
        "in_wishlist": in_wishlist,
        "spec_rows": spec_rows,
    })
