from django.core.paginator import Paginator
from django.db.models import Q
from django.shortcuts import get_object_or_404, render

from catalog.models import Brand, Category

from .models import Product

SORTS = {"newest": "-created", "price_low": "price", "price_high": "-price", "popular": "-views_count"}


def product_list(request):
    qs = Product.objects.filter(status="available").select_related("brand", "category").prefetch_related("images")
    g = request.GET
    if q := g.get("q", "").strip():
        qs = qs.filter(Q(name__icontains=q) | Q(model__icontains=q) | Q(stock_id__icontains=q))
    if brand := g.get("brand", "").strip():
        qs = qs.filter(brand__slug=brand)
    if category := g.get("category", "").strip():
        qs = qs.filter(category__slug=category)
    if condition := g.get("condition", "").strip():
        qs = qs.filter(condition=condition)
    qs = qs.order_by(SORTS.get(g.get("sort", "newest"), "-created"))

    paginator = Paginator(qs, 12)
    page = paginator.get_page(g.get("page"))
    params = request.GET.copy()
    params.pop("page", None)

    ctx = {
        "page_obj": page,
        "total": paginator.count,
        "brands": Brand.objects.order_by("name"),
        "categories": Category.objects.all(),
        "conditions": Product.CONDITION,
        "querystring": params.urlencode(),
        "current": request.GET,
    }
    if request.headers.get("HX-Request") and not request.headers.get("HX-Boosted"):
        return render(request, "shop/_product_results.html", ctx)
    return render(request, "shop/product_list.html", ctx)


def product_detail(request, slug):
    product = get_object_or_404(
        Product.objects.select_related("brand", "category", "origin_country").prefetch_related("images"),
        slug=slug,
    )
    Product.objects.filter(pk=product.pk).update(views_count=product.views_count + 1)
    related = (Product.objects.filter(status="available", category=product.category).exclude(pk=product.pk)
               .prefetch_related("images")[:4])
    in_wishlist = request.user.is_authenticated and request.user.wishlist_items.filter(product=product).exists()
    return render(request, "shop/product_detail.html", {
        "product": product, "related": related, "in_wishlist": in_wishlist,
    })
