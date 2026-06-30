from django.contrib import admin

from .models import Auction, Bid


class BidInline(admin.TabularInline):
    model = Bid
    extra = 0
    readonly_fields = ("user", "amount", "created")


@admin.register(Auction)
class AuctionAdmin(admin.ModelAdmin):
    list_display = ("title", "current_bid", "total_bids", "status", "start_date", "end_date", "featured")
    list_filter = ("status", "featured")
    search_fields = ("title", "description")
    inlines = [BidInline]


@admin.register(Bid)
class BidAdmin(admin.ModelAdmin):
    list_display = ("auction", "user", "amount", "created")
    list_filter = ("created",)
