from django.contrib.auth import authenticate
from django.db.models import Count, Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import generics, status
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import Inquiry, SavedSearch, Wishlist
from auctions.models import Auction, Bid
from catalog.models import Brand, Car, Category, Country
from core.models import SiteSettings, Slide, Testimonial
from shop.models import Product

from . import serializers as S
from .filters import CAR_SORTS, PRODUCT_SORTS, filter_cars


def ctx(request):
    return {"request": request}


# ── Site / home ──────────────────────────────────────────────────────────────
class SiteView(APIView):
    def get(self, request):
        return Response(S.SiteSettingsSerializer(SiteSettings.load(), context=ctx(request)).data)


class HomeView(APIView):
    def get(self, request):
        c = ctx(request)
        cars = Car.objects.available().select_related("brand", "category", "origin_country").prefetch_related("images")
        categories = (Category.objects.annotate(n=Count("cars", filter=Q(cars__status="available")))
                      .filter(n__gt=0).order_by("-n"))
        data = {
            "slides": S.SlideSerializer(Slide.objects.filter(active=True), many=True, context=c).data,
            "featured_cars": S.CarListSerializer(cars.filter(featured=True)[:8], many=True, context=c).data,
            "new_arrivals": S.CarListSerializer(cars.order_by("-created")[:8], many=True, context=c).data,
            "popular_cars": S.CarListSerializer(cars.order_by("-views_count")[:8], many=True, context=c).data,
            "categories": S.CategorySerializer(categories, many=True, context=c).data,
            "brands": S.BrandSerializer(Brand.objects.order_by("name"), many=True, context=c).data,
            "featured_products": S.ProductListSerializer(
                Product.objects.filter(status="available").prefetch_related("images")[:8], many=True, context=c).data,
            "live_auctions": S.AuctionListSerializer(
                Auction.objects.filter(end_date__gt=timezone.now()).prefetch_related("bids")[:6], many=True, context=c).data,
            "testimonials": S.TestimonialSerializer(Testimonial.objects.filter(active=True), many=True, context=c).data,
            "stats": {
                "total_cars": cars.count(),
                "total_brands": Brand.objects.count(),
                "total_products": Product.objects.count(),
                "countries_served": 120,
            },
        }
        return Response(data)


# ── Taxonomy ─────────────────────────────────────────────────────────────────
class BrandList(generics.ListAPIView):
    serializer_class = S.BrandSerializer
    pagination_class = None
    queryset = Brand.objects.order_by("name")


class CategoryList(generics.ListAPIView):
    serializer_class = S.CategorySerializer
    pagination_class = None
    queryset = Category.objects.all()


class CountryList(generics.ListAPIView):
    serializer_class = S.CountrySerializer
    pagination_class = None
    queryset = Country.objects.all()


# ── Cars ─────────────────────────────────────────────────────────────────────
class CarList(generics.ListAPIView):
    serializer_class = S.CarListSerializer

    def get_queryset(self):
        qs = Car.objects.available().select_related("brand", "category", "origin_country").prefetch_related("images")
        g = self.request.query_params
        qs = filter_cars(qs, g)
        return qs.order_by(CAR_SORTS.get(g.get("sort", "newest"), "-created"))


class CarDetail(APIView):
    def get(self, request, slug):
        car = get_object_or_404(
            Car.objects.select_related("brand", "category", "origin_country").prefetch_related("images"), slug=slug)
        Car.objects.filter(pk=car.pk).update(views_count=car.views_count + 1)
        c = ctx(request)
        related = (Car.objects.available().filter(category=car.category).exclude(pk=car.pk)
                   .select_related("brand").prefetch_related("images")[:4])
        data = S.CarDetailSerializer(car, context=c).data
        data["related"] = S.CarListSerializer(related, many=True, context=c).data
        return Response(data)


# ── Products ─────────────────────────────────────────────────────────────────
class ProductList(generics.ListAPIView):
    serializer_class = S.ProductListSerializer

    def get_queryset(self):
        qs = Product.objects.filter(status="available").select_related("brand", "category").prefetch_related("images")
        g = self.request.query_params
        if q := g.get("q", "").strip():
            qs = qs.filter(Q(name__icontains=q) | Q(model__icontains=q) | Q(stock_id__icontains=q))
        if v := g.get("brand", "").strip():
            qs = qs.filter(brand__slug=v)
        if v := g.get("category", "").strip():
            qs = qs.filter(category__slug=v)
        if v := g.get("condition", "").strip():
            qs = qs.filter(condition=v)
        return qs.order_by(PRODUCT_SORTS.get(g.get("sort", "newest"), "-created"))


class ProductDetail(APIView):
    def get(self, request, slug):
        product = get_object_or_404(
            Product.objects.select_related("brand", "category", "origin_country").prefetch_related("images"), slug=slug)
        Product.objects.filter(pk=product.pk).update(views_count=product.views_count + 1)
        c = ctx(request)
        related = (Product.objects.filter(status="available", category=product.category).exclude(pk=product.pk)
                   .prefetch_related("images")[:4])
        data = S.ProductDetailSerializer(product, context=c).data
        data["related"] = S.ProductListSerializer(related, many=True, context=c).data
        return Response(data)


# ── Auctions ─────────────────────────────────────────────────────────────────
class AuctionList(generics.ListAPIView):
    serializer_class = S.AuctionListSerializer
    pagination_class = None

    def get_queryset(self):
        now = timezone.now()
        qs = Auction.objects.prefetch_related("bids").select_related("car")
        tab = self.request.query_params.get("tab", "live")
        if tab == "ended":
            return qs.filter(end_date__lte=now).order_by("-end_date")
        if tab == "upcoming":
            return qs.filter(start_date__gt=now).order_by("start_date")
        return qs.filter(start_date__lte=now, end_date__gt=now).order_by("end_date")


class AuctionDetail(generics.RetrieveAPIView):
    serializer_class = S.AuctionDetailSerializer
    lookup_field = "slug"
    queryset = Auction.objects.prefetch_related("bids__user").select_related("car")


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def place_bid(request, slug):
    from decimal import Decimal, InvalidOperation
    auction = get_object_or_404(Auction, slug=slug)
    if auction.computed_status != "live":
        return Response({"detail": "This auction is not live."}, status=400)
    try:
        amount = Decimal(str(request.data.get("amount", "0")))
    except (InvalidOperation, TypeError):
        return Response({"detail": "Invalid amount."}, status=400)
    if amount < auction.next_min_bid:
        return Response({"detail": f"Bid must be at least ${auction.next_min_bid:,.0f}."}, status=400)
    Bid.objects.create(auction=auction, user=request.user, amount=amount)
    auction.current_bid = amount
    auction.save(update_fields=["current_bid"])
    return Response(S.AuctionDetailSerializer(auction, context=ctx(request)).data)


# ── Auth ─────────────────────────────────────────────────────────────────────
@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    ser = S.RegisterSerializer(data=request.data)
    ser.is_valid(raise_exception=True)
    user = ser.save()
    token, _ = Token.objects.get_or_create(user=user)
    return Response({"token": token.key, "user": S.UserSerializer(user).data}, status=201)


@api_view(["POST"])
@permission_classes([AllowAny])
def login(request):
    user = authenticate(username=request.data.get("username"), password=request.data.get("password"))
    if not user:
        return Response({"detail": "Invalid credentials."}, status=400)
    token, _ = Token.objects.get_or_create(user=user)
    return Response({"token": token.key, "user": S.UserSerializer(user).data})


@api_view(["GET", "PATCH"])
@permission_classes([IsAuthenticated])
def me(request):
    user = request.user
    if request.method == "PATCH":
        ser = S.UserSerializer(user, data=request.data, partial=True)
        ser.is_valid(raise_exception=True)
        ser.save()
    return Response(S.UserSerializer(user).data)


# ── Wishlist ─────────────────────────────────────────────────────────────────
class WishlistView(generics.ListAPIView):
    serializer_class = S.WishlistSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        return (self.request.user.wishlist_items
                .select_related("car__brand", "product__brand")
                .prefetch_related("car__images", "product__images"))


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def toggle_wishlist(request):
    kind = request.data.get("kind")
    obj_id = request.data.get("id")
    if kind == "car":
        obj = get_object_or_404(Car, pk=obj_id)
        item = Wishlist.objects.filter(user=request.user, car=obj).first()
        if item:
            item.delete(); active = False
        else:
            Wishlist.objects.create(user=request.user, car=obj); active = True
    elif kind == "product":
        obj = get_object_or_404(Product, pk=obj_id)
        item = Wishlist.objects.filter(user=request.user, product=obj).first()
        if item:
            item.delete(); active = False
        else:
            Wishlist.objects.create(user=request.user, product=obj); active = True
    else:
        return Response({"detail": "invalid kind"}, status=400)
    return Response({"active": active, "count": request.user.wishlist_items.count()})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def wishlist_ids(request):
    """Compact set of saved ids for hydrating heart buttons."""
    items = request.user.wishlist_items.values_list("car_id", "product_id")
    return Response({
        "cars": [c for c, p in items if c],
        "products": [p for c, p in items if p],
    })


# ── Inquiries ────────────────────────────────────────────────────────────────
@api_view(["POST"])
@permission_classes([AllowAny])
def create_inquiry(request):
    ser = S.InquirySerializer(data=request.data)
    ser.is_valid(raise_exception=True)
    ser.save(user=request.user if request.user.is_authenticated else None)
    return Response(ser.data, status=201)


# ── Saved searches ───────────────────────────────────────────────────────────
class SavedSearchList(generics.ListCreateAPIView):
    serializer_class = S.SavedSearchSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        return self.request.user.saved_searches.all()

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class SavedSearchDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = S.SavedSearchSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.request.user.saved_searches.all()


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def mark_search_seen(request, pk):
    """Clear the new-match badge by marking the current matches as seen."""
    search = get_object_or_404(SavedSearch, pk=pk, user=request.user)
    search.last_seen = timezone.now()
    search.save(update_fields=["last_seen"])
    return Response(S.SavedSearchSerializer(search, context=ctx(request)).data)
