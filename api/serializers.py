from django.contrib.auth import get_user_model
from rest_framework import serializers

from accounts.models import Inquiry, SavedSearch, Wishlist
from auctions.models import Auction, Bid
from catalog.models import Brand, Car, CarImage, Category, Country
from core.models import SiteSettings, Slide, Testimonial
from shop.models import Product, ProductImage

User = get_user_model()


def absolute(request, url):
    if not url:
        return ""
    if url.startswith("http"):
        return url
    return request.build_absolute_uri(url) if request else url


# ── Taxonomy ────────────────────────────────────────────────────────────────
class CountrySerializer(serializers.ModelSerializer):
    class Meta:
        model = Country
        fields = ["id", "name", "code", "flag_emoji"]


class BrandSerializer(serializers.ModelSerializer):
    logo = serializers.SerializerMethodField()
    car_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Brand
        fields = ["id", "name", "slug", "logo", "car_count"]

    def get_logo(self, obj):
        req = self.context.get("request")
        return absolute(req, obj.logo.url if obj.logo else obj.logo_url)


class CategorySerializer(serializers.ModelSerializer):
    car_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ["id", "name", "slug", "icon", "car_count"]

    def get_car_count(self, obj):
        return getattr(obj, "n", None) if hasattr(obj, "n") else obj.cars.filter(status="available").count()


# ── Cars ──────────────────────────────────────────────────────────────────
class CarImageSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()

    class Meta:
        model = CarImage
        fields = ["url", "is_primary"]

    def get_url(self, obj):
        return absolute(self.context.get("request"), obj.url)


class _BrandMini(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = ["name", "slug"]


class _CategoryMini(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["name", "slug", "icon"]


class CarListSerializer(serializers.ModelSerializer):
    title = serializers.CharField(read_only=True)
    thumbnail = serializers.SerializerMethodField()
    brand = _BrandMini(read_only=True)
    category = _CategoryMini(read_only=True)
    origin_country = CountrySerializer(read_only=True)
    condition_display = serializers.CharField(source="get_condition_display", read_only=True)

    class Meta:
        model = Car
        fields = [
            "id", "stock_id", "slug", "title", "make", "model", "year",
            "price", "fob_price", "cif_price", "mileage", "condition", "condition_display",
            "transmission", "fuel_type", "location", "featured", "views_count",
            "thumbnail", "brand", "category", "origin_country",
        ]

    def get_thumbnail(self, obj):
        img = obj.primary_image
        return absolute(self.context.get("request"), img.url) if img else ""


class CarDetailSerializer(CarListSerializer):
    images = CarImageSerializer(many=True, read_only=True)
    features = serializers.ListField(source="feature_list", read_only=True)
    drivetrain = serializers.CharField(read_only=True)
    steering_display = serializers.CharField(source="get_steering_display", read_only=True)

    class Meta(CarListSerializer.Meta):
        fields = CarListSerializer.Meta.fields + [
            "images", "description", "features", "engine_cc", "color", "doors", "seats",
            "drivetrain", "steering", "steering_display",
        ]


# ── Products ────────────────────────────────────────────────────────────────
class ProductImageSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()

    class Meta:
        model = ProductImage
        fields = ["url", "is_primary"]

    def get_url(self, obj):
        return absolute(self.context.get("request"), obj.url)


class ProductListSerializer(serializers.ModelSerializer):
    thumbnail = serializers.SerializerMethodField()
    brand = _BrandMini(read_only=True)
    category = _CategoryMini(read_only=True)
    condition_display = serializers.CharField(source="get_condition_display", read_only=True)

    class Meta:
        model = Product
        fields = [
            "id", "stock_id", "slug", "name", "model", "price", "condition",
            "condition_display", "location", "featured", "views_count",
            "thumbnail", "brand", "category",
        ]

    def get_thumbnail(self, obj):
        img = obj.primary_image
        return absolute(self.context.get("request"), img.url) if img else ""


class ProductDetailSerializer(ProductListSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    specifications = serializers.ListField(source="spec_pairs", read_only=True)

    class Meta(ProductListSerializer.Meta):
        fields = ProductListSerializer.Meta.fields + ["images", "description", "specifications"]


# ── Auctions ────────────────────────────────────────────────────────────────
class _CarMiniForAuction(serializers.ModelSerializer):
    title = serializers.CharField(read_only=True)

    class Meta:
        model = Car
        fields = ["slug", "title"]


class BidSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    initials = serializers.CharField(source="user.initials", read_only=True)

    class Meta:
        model = Bid
        fields = ["id", "username", "initials", "amount", "created"]


class AuctionListSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    total_bids = serializers.IntegerField(read_only=True)
    status = serializers.CharField(source="computed_status", read_only=True)
    next_min_bid = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    car = _CarMiniForAuction(read_only=True)

    class Meta:
        model = Auction
        fields = [
            "id", "title", "slug", "image", "current_bid", "starting_price",
            "bid_increment", "total_bids", "next_min_bid", "start_date", "end_date",
            "status", "featured", "car",
        ]

    def get_image(self, obj):
        return absolute(self.context.get("request"), obj.url)


class AuctionDetailSerializer(AuctionListSerializer):
    bids = serializers.SerializerMethodField()

    class Meta(AuctionListSerializer.Meta):
        fields = AuctionListSerializer.Meta.fields + ["description", "bids"]

    def get_bids(self, obj):
        qs = obj.bids.select_related("user")[:15]
        return BidSerializer(qs, many=True, context=self.context).data


# ── Site / marketing ─────────────────────────────────────────────────────────
class SlideSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = Slide
        fields = ["title", "subtitle", "button_text", "link", "image"]

    def get_image(self, obj):
        return absolute(self.context.get("request"), obj.url)


class TestimonialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Testimonial
        fields = ["name", "country", "role", "quote", "rating"]


class SiteSettingsSerializer(serializers.ModelSerializer):
    social_links = serializers.SerializerMethodField()

    class Meta:
        model = SiteSettings
        fields = [
            "site_name", "tagline", "site_description", "contact_email",
            "contact_phone", "whatsapp_number", "company_address", "social_links",
        ]

    def get_social_links(self, obj):
        return dict(obj.social_links)


# ── Accounts ─────────────────────────────────────────────────────────────────
class UserSerializer(serializers.ModelSerializer):
    display_name = serializers.CharField(read_only=True)
    initials = serializers.CharField(read_only=True)

    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name",
                  "display_name", "initials", "phone", "country"]


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ["username", "email", "password", "first_name", "last_name", "phone", "country"]

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class WishlistSerializer(serializers.ModelSerializer):
    kind = serializers.SerializerMethodField()
    car = CarListSerializer(read_only=True)
    product = ProductListSerializer(read_only=True)

    class Meta:
        model = Wishlist
        fields = ["id", "kind", "car", "product", "created"]

    def get_kind(self, obj):
        return "car" if obj.car_id else "product"


class InquirySerializer(serializers.ModelSerializer):
    class Meta:
        model = Inquiry
        fields = ["id", "name", "email", "phone", "country", "subject", "message", "car", "created"]
        read_only_fields = ["id", "created"]


class SavedSearchSerializer(serializers.ModelSerializer):
    matches = serializers.SerializerMethodField()
    new_matches = serializers.SerializerMethodField()

    class Meta:
        model = SavedSearch
        fields = ["id", "name", "query", "alerts", "matches", "new_matches", "last_seen", "created"]
        read_only_fields = ["id", "matches", "new_matches", "last_seen", "created"]

    def _matching_cars(self, obj):
        from django.http import QueryDict

        from .filters import filter_cars
        return filter_cars(Car.objects.available(), QueryDict(obj.query))

    def get_matches(self, obj):
        return self._matching_cars(obj).count()

    def get_new_matches(self, obj):
        return self._matching_cars(obj).filter(created__gt=obj.last_seen).count()
