from django.db import models
from django.urls import reverse
from django.utils.text import slugify

from catalog.models import Brand, Category, Country


class Product(models.Model):
    CONDITION = [("new", "New"), ("used", "Used"), ("refurbished", "Refurbished")]
    STATUS = [("available", "Available"), ("out_of_stock", "Out of Stock")]

    stock_id = models.CharField(max_length=30, unique=True)
    name = models.CharField(max_length=160)
    model = models.CharField(max_length=120, blank=True)
    slug = models.SlugField(max_length=200, unique=True, blank=True)
    brand = models.ForeignKey(Brand, on_delete=models.SET_NULL, null=True, blank=True, related_name="products")
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name="products")
    origin_country = models.ForeignKey(Country, on_delete=models.SET_NULL, null=True, blank=True, related_name="products")

    price = models.DecimalField(max_digits=12, decimal_places=2)
    condition = models.CharField(max_length=20, choices=CONDITION, default="used")
    location = models.CharField(max_length=80, default="Japan")
    description = models.TextField(blank=True)
    specifications = models.TextField(blank=True, help_text="key: value per line")

    featured = models.BooleanField(default=False)
    status = models.CharField(max_length=20, choices=STATUS, default="available")
    views_count = models.PositiveIntegerField(default=0)
    created = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created"]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(f"{self.name}-{self.stock_id}")[:200]
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

    def get_absolute_url(self):
        return reverse("shop:product_detail", args=[self.slug])

    @property
    def primary_image(self):
        return self.images.filter(is_primary=True).first() or self.images.first()

    @property
    def spec_pairs(self):
        pairs = []
        for line in self.specifications.splitlines():
            if ":" in line:
                k, v = line.split(":", 1)
                pairs.append((k.strip(), v.strip()))
        return pairs


class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="images")
    image = models.ImageField(upload_to="products/", blank=True, null=True)
    image_url = models.URLField(blank=True)
    is_primary = models.BooleanField(default=False)
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ["-is_primary", "order", "id"]

    @property
    def url(self):
        if self.image:
            return self.image.url
        return self.image_url
