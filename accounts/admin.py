from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import Inquiry, User, Wishlist


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    fieldsets = BaseUserAdmin.fieldsets + (("Profile", {"fields": ("phone", "country", "avatar")}),)
    list_display = ("username", "email", "display_name", "country", "is_staff")


@admin.register(Inquiry)
class InquiryAdmin(admin.ModelAdmin):
    list_display = ("name", "email", "subject", "car", "status", "created")
    list_filter = ("status", "created")
    search_fields = ("name", "email", "subject", "message")
    list_editable = ("status",)


@admin.register(Wishlist)
class WishlistAdmin(admin.ModelAdmin):
    list_display = ("user", "car", "product", "created")
