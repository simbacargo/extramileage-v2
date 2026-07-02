"""Shared query filtering so the /cars browse endpoint and saved-search
alert matching stay in lockstep — a saved search must count exactly the
cars the same filters would list."""
from django.db.models import Q

CAR_SORTS = {
    "newest": "-created", "price_low": "price", "price_high": "-price",
    "year_new": "-year", "mileage_low": "mileage", "popular": "-views_count",
}
PRODUCT_SORTS = {"newest": "-created", "price_low": "price", "price_high": "-price", "popular": "-views_count"}


def filter_cars(qs, g):
    """Apply the car filter params in ``g`` (a QueryDict / dict-like) to ``qs``.

    Sorting is deliberately left to the caller — match counting doesn't need it.
    """
    if q := g.get("q", "").strip():
        qs = qs.filter(Q(make__icontains=q) | Q(model__icontains=q) | Q(stock_id__icontains=q) | Q(description__icontains=q))
    if v := g.get("brand", "").strip():
        qs = qs.filter(brand__slug=v)
    if v := g.get("category", "").strip():
        qs = qs.filter(category__slug=v)
    if v := g.get("fuel", "").strip():
        qs = qs.filter(fuel_type=v)
    if v := g.get("transmission", "").strip():
        qs = qs.filter(transmission=v)
    if v := g.get("condition", "").strip():
        qs = qs.filter(condition=v)
    if v := g.get("steering", "").strip():
        qs = qs.filter(steering=v)
    for field, lookup in [("year_min", "year__gte"), ("year_max", "year__lte"),
                          ("price_min", "price__gte"), ("price_max", "price__lte")]:
        val = g.get(field, "").strip()
        if val.isdigit():
            qs = qs.filter(**{lookup: int(val)})
    return qs
