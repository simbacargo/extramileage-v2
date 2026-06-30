from catalog.models import Brand, Category
from .models import SiteSettings


def site_context(request):
    wishlist_count = 0
    if request.user.is_authenticated:
        wishlist_count = request.user.wishlist_items.count()
    return {
        "site": SiteSettings.load(),
        "nav_categories": Category.objects.all()[:12],
        "nav_brands": Brand.objects.order_by("name")[:24],
        "wishlist_count": wishlist_count,
    }
