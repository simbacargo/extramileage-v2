from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    phone = models.CharField(max_length=40, blank=True)
    country = models.CharField(max_length=80, blank=True)
    avatar = models.ImageField(upload_to="avatars/", blank=True, null=True)

    def __str__(self):
        return self.get_full_name() or self.username

    @property
    def display_name(self):
        return self.get_full_name() or self.username

    @property
    def initials(self):
        name = self.display_name.strip()
        parts = [p for p in name.split() if p]
        if not parts:
            return "U"
        if len(parts) == 1:
            return parts[0][:2].upper()
        return (parts[0][0] + parts[-1][0]).upper()


class Wishlist(models.Model):
    """A saved car or product for a user."""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="wishlist_items")
    car = models.ForeignKey("catalog.Car", on_delete=models.CASCADE, null=True, blank=True, related_name="wishlisted_by")
    product = models.ForeignKey("shop.Product", on_delete=models.CASCADE, null=True, blank=True, related_name="wishlisted_by")
    created = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created"]
        constraints = [
            models.UniqueConstraint(fields=["user", "car"], name="uniq_user_car", condition=models.Q(car__isnull=False)),
            models.UniqueConstraint(fields=["user", "product"], name="uniq_user_product", condition=models.Q(product__isnull=False)),
        ]

    def __str__(self):
        return f"{self.user} → {self.car or self.product}"


class Inquiry(models.Model):
    STATUS = [("new", "New"), ("in_progress", "In Progress"), ("closed", "Closed")]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="inquiries")
    name = models.CharField(max_length=120)
    email = models.EmailField()
    phone = models.CharField(max_length=40, blank=True)
    country = models.CharField(max_length=80, blank=True)
    subject = models.CharField(max_length=200, blank=True)
    message = models.TextField()
    car = models.ForeignKey("catalog.Car", on_delete=models.SET_NULL, null=True, blank=True, related_name="inquiries")
    status = models.CharField(max_length=20, choices=STATUS, default="new")
    created = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created"]
        verbose_name_plural = "Inquiries"

    def __str__(self):
        return f"{self.name} — {self.subject or 'General inquiry'}"
