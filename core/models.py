from django.core.cache import cache
from django.db import models


class SiteSettings(models.Model):
    """Singleton holding global site configuration."""
    site_name = models.CharField(max_length=120, default="Extra Mileage Logistics")
    tagline = models.CharField(max_length=200, default="Premium Japanese Used Cars Export")
    site_description = models.TextField(default="Quality vehicles direct from Japan, shipped worldwide.")

    contact_email = models.EmailField(default="info@extramileage.com")
    contact_phone = models.CharField(max_length=40, default="+81 (0)-80-7050-3366")
    whatsapp_number = models.CharField(max_length=40, blank=True, default="+81-80-7050-3366")
    company_address = models.CharField(max_length=200, default="1-2-3 Shibuya, Shibuya City, Tokyo 150-0002, Japan")

    facebook = models.URLField(blank=True, default="https://facebook.com/Extramileage")
    twitter = models.URLField(blank=True, default="https://twitter.com/Extramileage")
    instagram = models.URLField(blank=True, default="https://instagram.com/Extramileage")
    linkedin = models.URLField(blank=True, default="https://linkedin.com/company/Extramileage")
    youtube = models.URLField(blank=True, default="https://youtube.com/@Extramileage")
    tiktok = models.URLField(blank=True, default="https://tiktok.com/@Extramileage")

    class Meta:
        verbose_name = "Site Settings"
        verbose_name_plural = "Site Settings"

    def __str__(self):
        return self.site_name

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)
        cache.delete("site_settings")

    @classmethod
    def load(cls):
        obj = cache.get("site_settings")
        if obj is None:
            obj, _ = cls.objects.get_or_create(pk=1)
            cache.set("site_settings", obj, 300)
        return obj

    @property
    def social_links(self):
        items = [
            ("facebook", self.facebook), ("twitter", self.twitter),
            ("instagram", self.instagram), ("linkedin", self.linkedin),
            ("youtube", self.youtube), ("tiktok", self.tiktok),
        ]
        return [(name, url) for name, url in items if url]


class Slide(models.Model):
    title = models.CharField(max_length=160)
    subtitle = models.CharField(max_length=240, blank=True)
    button_text = models.CharField(max_length=60, default="Browse Cars")
    link = models.CharField(max_length=200, default="/cars/")
    image = models.ImageField(upload_to="slides/", blank=True, null=True)
    image_url = models.URLField(blank=True)
    order = models.PositiveSmallIntegerField(default=0)
    active = models.BooleanField(default=True)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        return self.title

    @property
    def url(self):
        if self.image:
            return self.image.url
        return self.image_url


class Testimonial(models.Model):
    name = models.CharField(max_length=120)
    country = models.CharField(max_length=80, blank=True)
    role = models.CharField(max_length=120, blank=True)
    quote = models.TextField()
    rating = models.PositiveSmallIntegerField(default=5)
    avatar_url = models.URLField(blank=True)
    active = models.BooleanField(default=True)
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        return f"{self.name} ({self.country})"
