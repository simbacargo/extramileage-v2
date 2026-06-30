from django.db import models
from django.urls import reverse
from django.utils.text import slugify


class Country(models.Model):
    name = models.CharField(max_length=80, unique=True)
    code = models.CharField(max_length=2, blank=True, help_text="ISO alpha-2, e.g. jp")
    flag_emoji = models.CharField(max_length=8, blank=True)

    class Meta:
        ordering = ["name"]
        verbose_name_plural = "Countries"

    def __str__(self):
        return self.name


class Brand(models.Model):
    name = models.CharField(max_length=80, unique=True)
    slug = models.SlugField(max_length=90, unique=True, blank=True)
    logo = models.ImageField(upload_to="brands/", blank=True, null=True)
    logo_url = models.URLField(blank=True)

    class Meta:
        ordering = ["name"]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

    @property
    def car_count(self):
        return self.cars.filter(status="available").count()


class Category(models.Model):
    name = models.CharField(max_length=80, unique=True)
    slug = models.SlugField(max_length=90, unique=True, blank=True)
    icon = models.CharField(max_length=40, blank=True, help_text="Font Awesome icon name, e.g. car")

    class Meta:
        ordering = ["name"]
        verbose_name_plural = "Categories"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class CarQuerySet(models.QuerySet):
    def available(self):
        return self.filter(status="available")

    def featured(self):
        return self.available().filter(featured=True)


class Car(models.Model):
    CONDITION = [("new", "New"), ("used", "Used"), ("certified", "Certified Pre-Owned")]
    TRANSMISSION = [("Automatic", "Automatic"), ("Manual", "Manual"), ("CVT", "CVT"), ("AMT", "AMT")]
    FUEL = [("Petrol", "Petrol"), ("Diesel", "Diesel"), ("Hybrid", "Hybrid"), ("Electric", "Electric"), ("Plug-in Hybrid", "Plug-in Hybrid")]
    DRIVETRAIN = [("2WD", "2WD"), ("4WD", "4WD"), ("AWD", "AWD"), ("FWD", "FWD"), ("RWD", "RWD")]
    STEERING = [("Right", "Right Hand"), ("Left", "Left Hand")]
    STATUS = [("available", "Available"), ("reserved", "Reserved"), ("sold", "Sold")]

    stock_id = models.CharField(max_length=30, unique=True)
    make = models.CharField(max_length=80)
    model = models.CharField(max_length=120)
    slug = models.SlugField(max_length=180, unique=True, blank=True)
    brand = models.ForeignKey(Brand, on_delete=models.SET_NULL, null=True, related_name="cars")
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name="cars")
    origin_country = models.ForeignKey(Country, on_delete=models.SET_NULL, null=True, blank=True, related_name="cars")

    year = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=12, decimal_places=2)
    fob_price = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    cif_price = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    mileage = models.PositiveIntegerField(default=0, help_text="km")

    condition = models.CharField(max_length=20, choices=CONDITION, default="used")
    transmission = models.CharField(max_length=20, choices=TRANSMISSION, default="Automatic")
    fuel_type = models.CharField(max_length=20, choices=FUEL, default="Petrol")
    drivetrain = models.CharField(max_length=10, choices=DRIVETRAIN, default="2WD")
    steering = models.CharField(max_length=10, choices=STEERING, default="Right")
    engine_cc = models.PositiveIntegerField(null=True, blank=True)
    color = models.CharField(max_length=40, blank=True)
    doors = models.PositiveSmallIntegerField(default=4)
    seats = models.PositiveSmallIntegerField(default=5)

    location = models.CharField(max_length=80, default="Japan")
    description = models.TextField(blank=True)
    features = models.TextField(blank=True, help_text="One feature per line")

    featured = models.BooleanField(default=False)
    status = models.CharField(max_length=20, choices=STATUS, default="available")
    views_count = models.PositiveIntegerField(default=0)
    created = models.DateTimeField(auto_now_add=True)

    objects = CarQuerySet.as_manager()

    class Meta:
        ordering = ["-created"]

    def save(self, *args, **kwargs):
        if not self.slug:
            base = slugify(f"{self.year}-{self.make}-{self.model}-{self.stock_id}")
            self.slug = base[:180]
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.year} {self.make} {self.model}"

    def get_absolute_url(self):
        return reverse("catalog:car_detail", args=[self.slug])

    @property
    def title(self):
        return f"{self.year} {self.make} {self.model}"

    @property
    def primary_image(self):
        return self.images.filter(is_primary=True).first() or self.images.first()

    @property
    def feature_list(self):
        return [f.strip() for f in self.features.splitlines() if f.strip()]


class CarImage(models.Model):
    car = models.ForeignKey(Car, on_delete=models.CASCADE, related_name="images")
    image = models.ImageField(upload_to="cars/", blank=True, null=True)
    image_url = models.URLField(blank=True)
    is_primary = models.BooleanField(default=False)
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ["-is_primary", "order", "id"]

    def __str__(self):
        return f"Image for car {self.car_id}"

    @property
    def url(self):
        if self.image:
            return self.image.url
        return self.image_url
