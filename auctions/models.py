from decimal import Decimal

from django.conf import settings
from django.db import models
from django.urls import reverse
from django.utils import timezone
from django.utils.text import slugify


class Auction(models.Model):
    STATUS = [("scheduled", "Scheduled"), ("live", "Live"), ("ended", "Ended")]

    title = models.CharField(max_length=160)
    slug = models.SlugField(max_length=180, unique=True, blank=True)
    description = models.TextField(blank=True)
    car = models.ForeignKey("catalog.Car", on_delete=models.SET_NULL, null=True, blank=True, related_name="auctions")
    image = models.ImageField(upload_to="auctions/", blank=True, null=True)
    image_url = models.URLField(blank=True)

    starting_price = models.DecimalField(max_digits=12, decimal_places=2)
    current_bid = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    bid_increment = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("100"))
    reserve_price = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)

    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    status = models.CharField(max_length=20, choices=STATUS, default="live")
    featured = models.BooleanField(default=False)
    created = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["end_date"]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(f"{self.title}")[:180] or "auction"
        if self.current_bid is None:
            self.current_bid = self.starting_price
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title

    def get_absolute_url(self):
        return reverse("auctions:detail", args=[self.slug])

    @property
    def url(self):
        if self.image:
            return self.image.url
        if self.image_url:
            return self.image_url
        if self.car and self.car.primary_image:
            return self.car.primary_image.url
        return ""

    @property
    def total_bids(self):
        return self.bids.count()

    @property
    def is_live(self):
        now = timezone.now()
        return self.start_date <= now < self.end_date

    @property
    def has_ended(self):
        return timezone.now() >= self.end_date

    @property
    def next_min_bid(self):
        return (self.current_bid or self.starting_price) + self.bid_increment

    @property
    def computed_status(self):
        now = timezone.now()
        if now < self.start_date:
            return "scheduled"
        if now >= self.end_date:
            return "ended"
        return "live"

    @property
    def top_bidder(self):
        bid = self.bids.first()
        return bid.user if bid else None


class Bid(models.Model):
    auction = models.ForeignKey(Auction, on_delete=models.CASCADE, related_name="bids")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="bids")
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    created = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-amount", "-created"]

    def __str__(self):
        return f"{self.user} bid {self.amount} on {self.auction_id}"
