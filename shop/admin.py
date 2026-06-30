from django.contrib import admin

from .models import Product, ProductImage


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("stock_id", "name", "brand", "category", "price", "status", "featured")
    list_filter = ("status", "featured", "condition", "brand", "category")
    search_fields = ("stock_id", "name", "model")
    list_editable = ("featured", "status")
    inlines = [ProductImageInline]
