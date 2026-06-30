from django.contrib import admin

from .models import Brand, Car, CarImage, Category, Country


class CarImageInline(admin.TabularInline):
    model = CarImage
    extra = 1


@admin.register(Car)
class CarAdmin(admin.ModelAdmin):
    list_display = ("stock_id", "title", "brand", "category", "price", "status", "featured", "views_count")
    list_filter = ("status", "featured", "condition", "fuel_type", "transmission", "brand", "category")
    search_fields = ("stock_id", "make", "model")
    list_editable = ("featured", "status")
    inlines = [CarImageInline]
    prepopulated_fields = {"slug": ("make", "model")}


@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "car_count")
    search_fields = ("name",)


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "icon")
    search_fields = ("name",)


@admin.register(Country)
class CountryAdmin(admin.ModelAdmin):
    list_display = ("name", "code", "flag_emoji")
