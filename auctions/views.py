from decimal import Decimal, InvalidOperation

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.shortcuts import get_object_or_404, redirect, render
from django.template.loader import render_to_string
from django.utils import timezone

from .consumers import group_name
from .models import Auction, Bid


def broadcast_bid_panel(auction):
    """Push the refreshed bid panel to every connected watcher of this auction."""
    auction.refresh_from_db()
    html = render_to_string("auctions/_bid_panel.html", {
        "auction": auction,
        "bids": auction.bids.select_related("user")[:15],
        "error": None,
        "oob": True,
    })
    layer = get_channel_layer()
    if layer is not None:
        async_to_sync(layer.group_send)(group_name(auction.slug), {"type": "bid.update", "html": html})


def auction_list(request):
    now = timezone.now()
    qs = Auction.objects.prefetch_related("bids").select_related("car")
    tab = request.GET.get("tab", "live")
    if tab == "ended":
        qs = qs.filter(end_date__lte=now).order_by("-end_date")
    elif tab == "upcoming":
        qs = qs.filter(start_date__gt=now).order_by("start_date")
    else:
        tab = "live"
        qs = qs.filter(start_date__lte=now, end_date__gt=now).order_by("end_date")
    return render(request, "auctions/auction_list.html", {"auctions": qs, "tab": tab})


def auction_detail(request, slug):
    auction = get_object_or_404(Auction.objects.select_related("car").prefetch_related("bids__user"), slug=slug)
    bids = auction.bids.select_related("user")[:15]
    return render(request, "auctions/auction_detail.html", {"auction": auction, "bids": bids})


@login_required
def place_bid(request, slug):
    auction = get_object_or_404(Auction, slug=slug)
    if request.method != "POST":
        return redirect(auction.get_absolute_url())

    error = None
    if auction.computed_status != "live":
        error = "This auction is not currently live."
    else:
        try:
            amount = Decimal(request.POST.get("amount", "0"))
        except (InvalidOperation, TypeError):
            amount = Decimal("0")
        if amount < auction.next_min_bid:
            error = f"Your bid must be at least ${auction.next_min_bid:,.0f}."
        else:
            Bid.objects.create(auction=auction, user=request.user, amount=amount)
            auction.current_bid = amount
            auction.save(update_fields=["current_bid"])
            broadcast_bid_panel(auction)

    if request.headers.get("HX-Request"):
        auction.refresh_from_db()
        ctx = {"auction": auction, "bids": auction.bids.select_related("user")[:15], "error": error}
        return render(request, "auctions/_bid_panel.html", ctx)

    if error:
        messages.error(request, error)
    else:
        messages.success(request, "Bid placed — you're in the lead!")
    return redirect(auction.get_absolute_url())


def auction_status(request, slug):
    """HTMX polling endpoint for live price + bid feed."""
    auction = get_object_or_404(Auction.objects.prefetch_related("bids__user"), slug=slug)
    ctx = {"auction": auction, "bids": auction.bids.select_related("user")[:15], "error": None}
    return render(request, "auctions/_bid_panel.html", ctx)
