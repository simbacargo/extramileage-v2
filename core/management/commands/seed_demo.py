import random
from datetime import timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.utils import timezone

from accounts.models import Inquiry, Wishlist
from auctions.models import Auction, Bid
from catalog.models import Brand, Car, CarImage, Category, Country
from core.models import SiteSettings, Slide, Testimonial
from shop.models import Product, ProductImage

User = get_user_model()


# Curated, verified Unsplash car photos (stable CDN IDs)
CAR_PHOTOS = [
    "1568844293986-8d0400bd4745", "1525609004556-c46c7d6cf023", "1580273916550-e323be2ae537",
    "1503376780353-7e6692767b70", "1511919884226-fd3cad34687c", "1492144534655-ae79c964c9d7",
    "1549317661-bd32c8ce0db2", "1606152421802-db97b9c7a11b", "1571607388263-1044f9ea01dd",
    "1553440569-bcc63803a83d", "1503736334956-4c8f8e92946d", "1617469767053-d3b523a0b982",
    "1606220588913-b3aacb4d2f46", "1552519507-da3b142c6e3d", "1494976388531-d1058494cdd8",
    "1542228262-3d663b306a53", "1493238792000-8113da705763", "1612825173281-9a193378527e",
    "1605559424843-9e4c228bf1c2", "1568605117036-5fe5e7bab0b7", "1542362567-b07e54358753",
    "1502161254066-6c74afbf07aa", "1606664515524-ed2f786a0bd6", "1556800572-1b8aeef2c54f",
    "1583121274602-3e2820c69888", "1549399542-7e3f8b79c341", "1544636331-e26879cd4d9b",
    "1502877338535-766e1452684a",
]
MOTO_PHOTOS = [
    "1568772585407-9361f9bf3a87", "1558981403-c5f9899a28bc", "1591637333184-19aa84b3e01f",
    "1609630875171-b1321377ee65", "1449426468159-d96dbf08f19f", "1547549082-6bc09f2049ae",
]
MACHINE_PHOTOS = [
    "1517524008697-84bbe3c3fd98", "1486262715619-67b85e0b08d3", "1571068316344-75bc76f77890",
    "1558981852-426c6c22a060",
]


def unsplash(photo_id):
    return f"https://images.unsplash.com/photo-{photo_id}?w=900&q=72&auto=format&fit=crop"


COUNTRIES = [
    ("Japan", "jp", "🇯🇵"), ("China", "cn", "🇨🇳"), ("Germany", "de", "🇩🇪"),
    ("South Korea", "kr", "🇰🇷"), ("United Kingdom", "gb", "🇬🇧"),
]

CATEGORIES = [
    ("SUV", "truck-monster"), ("Sedan", "car"), ("Hatchback", "car-side"),
    ("Pickup Truck", "truck-pickup"), ("Truck", "truck"), ("Van", "van-shuttle"),
    ("Minivan", "shuttle-van"), ("Wagon", "car-side"), ("Coupe", "car-sport"),
]

# model keyword -> body-type category
MODEL_CATEGORY = {
    "SUV": ["Land Cruiser", "Prado", "Patrol", "Pajero", "RAV4", "CX-5", "CX-8", "CX-30",
            "Forester", "X-Trail", "CR-V", "Outlander", "Jimny", "Vitara", "MU-X", "Tang",
            "Atto 3", "Song", "NX", "RX", "GX", "GLE", "X5", "X3", "Touareg", "Tiguan", "Vezel"],
    "Pickup Truck": ["Hilux", "D-Max", "Triton", "BT-50", "Ranger"],
    "Minivan": ["Alphard", "Vellfire", "Serena", "Delica", "Odyssey"],
    "Van": ["Hiace", "Every"],
    "Truck": ["Elf", "Forward", "Dutro", "Profia", "Canter"],
    "Hatchback": ["Fit", "Swift", "Golf", "Polo", "Note", "Prius", "Dolphin"],
    "Wagon": ["Outback", "Levorg"],
    "Coupe": ["GT-R", "MX-5", "WRX", "M4", "Eclipse Cross", "Skyline"],
}


def categorize(model):
    for cat, keys in MODEL_CATEGORY.items():
        if any(k in model for k in keys):
            return cat
    return "Sedan"

# brand -> (models, base_price, category, fuels)
BRANDS = {
    "Toyota": (["Land Cruiser", "Hilux", "Alphard", "Crown", "Corolla", "Prius", "RAV4", "Vellfire", "Hiace", "Land Cruiser Prado"], 18000, "SUV"),
    "Lexus": (["LX 600", "RX 350", "ES 300h", "NX 350", "LS 500", "GX 460"], 42000, "Luxury"),
    "Nissan": (["GT-R", "Patrol", "X-Trail", "Note", "Serena", "Skyline"], 16000, "SUV"),
    "Honda": (["CR-V", "Civic", "Vezel", "Fit", "Odyssey", "Accord"], 14000, "Hatchback"),
    "Mazda": (["CX-5", "CX-8", "Mazda3", "MX-5", "CX-30", "BT-50"], 15000, "SUV"),
    "Subaru": (["Forester", "Outback", "Impreza", "WRX", "Levorg"], 17000, "Wagon"),
    "Mitsubishi": (["Pajero", "Outlander", "Triton", "Delica", "Eclipse Cross"], 15000, "SUV"),
    "BYD": (["Atto 3", "Han EV", "Tang", "Seal", "Dolphin", "Song Plus"], 24000, "Electric"),
    "Mercedes-Benz": (["C 200", "E 350", "GLE 450", "S 500", "GLC 300"], 48000, "Luxury"),
    "BMW": (["320i", "X5", "X3", "530i", "M4"], 46000, "Luxury"),
    "Volkswagen": (["Golf", "Tiguan", "Passat", "Polo", "Touareg"], 19000, "Hatchback"),
    "Isuzu": (["D-Max", "Elf", "Forward", "MU-X"], 21000, "Pickup Truck"),
    "Hino": (["Dutro", "Ranger", "Profia"], 28000, "Truck"),
    "Suzuki": (["Jimny", "Swift", "Vitara", "Every", "Hustler"], 12000, "Hatchback"),
}

COLORS = ["Pearl White", "Jet Black", "Silver Metallic", "Midnight Blue", "Gunmetal Grey", "Champagne", "Deep Red", "Bronze"]
TRANS = ["Automatic", "Manual", "CVT"]
FUELS = ["Petrol", "Diesel", "Hybrid", "Electric"]
DRIVE = ["2WD", "4WD", "AWD", "FWD"]

FEATURES = [
    "Leather seats", "Sunroof / Moonroof", "360° camera", "Adaptive cruise control",
    "Lane-keep assist", "Heated seats", "Apple CarPlay / Android Auto", "Keyless entry & start",
    "Power tailgate", "Blind-spot monitor", "LED headlamps", "Premium sound system",
    "Navigation", "Dual-zone climate", "Alloy wheels", "Parking sensors",
]

TESTIMONIALS = [
    ("James Okonkwo", "Lagos, Nigeria", "Importer", "Third unit through Extra Mileage. Grading was spot-on and the CIF quote held exactly. Smoothest import I've done.", 5),
    ("Aisha Rahman", "Mombasa, Kenya", "Dealer", "The inspection sheets made it easy to trust the buy from across the world. Car arrived exactly as described.", 5),
    ("David Thompson", "Kingston, Jamaica", "Private buyer", "Bid on a Land Cruiser in their live auction and won under budget. Shipping updates the whole way. Recommended.", 5),
    ("Maria Santos", "Manila, Philippines", "Fleet manager", "Bought five vans for our fleet. Pricing transparent, paperwork handled, zero surprises at the port.", 4),
    ("Tariq Hassan", "Dar es Salaam, Tanzania", "Importer", "English support actually replies within hours. Rare in this business. Will keep sourcing through them.", 5),
    ("Grace Mwangi", "Nairobi, Kenya", "Private buyer", "My Lexus RX was immaculate. The mono spec sheet matched the real car to the kilometre.", 5),
]


class Command(BaseCommand):
    help = "Seed the marketplace with realistic demo data"

    def add_arguments(self, parser):
        parser.add_argument("--cars", type=int, default=64)
        parser.add_argument("--fresh", action="store_true", help="Wipe existing demo data first")

    def handle(self, *args, **opts):
        random.seed(7)
        if opts["fresh"]:
            self.stdout.write("Wiping existing data…")
            for m in (Bid, Auction, CarImage, Car, ProductImage, Product, Wishlist, Inquiry, Testimonial, Slide, Brand, Category, Country):
                m.objects.all().delete()
            User.objects.filter(is_superuser=False).delete()

        SiteSettings.load()

        countries = {name: Country.objects.get_or_create(name=name, defaults={"code": code, "flag_emoji": flag})[0]
                     for name, code, flag in COUNTRIES}
        categories = {name: Category.objects.get_or_create(name=name, defaults={"icon": icon})[0]
                      for name, icon in CATEGORIES}
        brands = {name: Brand.objects.get_or_create(name=name)[0] for name in BRANDS}

        self.stdout.write("Creating cars…")
        n = opts["cars"]
        created_cars = []
        for i in range(n):
            bname = random.choice(list(BRANDS))
            models, base, default_cat = BRANDS[bname]
            model = random.choice(models)
            year = random.randint(2015, 2025)
            cat_name = categorize(model)
            if "EV" in model or model in ("Atto 3", "Han EV", "Seal", "Dolphin", "Tang"):
                fuel = "Electric"
            elif model in ("Prius", "Vezel"):
                fuel = "Hybrid"
            else:
                fuel = random.choice(FUELS)
            age = 2026 - year
            price = base + random.randint(-3000, 12000) + (year - 2015) * 1400
            price = max(4200, price)
            fob = int(price * 0.78)
            cif = int(price * 0.82)
            car = Car.objects.create(
                stock_id=f"EM{random.randint(10000, 99999)}",
                make=bname, model=model, brand=brands[bname],
                category=categories.get(cat_name, categories["SUV"]),
                origin_country=countries["Japan"] if bname not in ("BYD",) else countries["China"],
                year=year, price=price, fob_price=fob, cif_price=cif,
                mileage=random.randint(8, 145) * 1000,
                condition=random.choice(["used", "used", "used", "certified", "new"]),
                transmission=random.choice(TRANS), fuel_type=fuel,
                drivetrain=random.choice(DRIVE),
                steering=random.choice(["Right", "Right", "Right", "Left"]),
                engine_cc=random.choice([1300, 1500, 1800, 2000, 2400, 2500, 3000, 3500, 0 if fuel == "Electric" else 2000]),
                color=random.choice(COLORS),
                doors=random.choice([2, 4, 4, 5]), seats=random.choice([2, 4, 5, 5, 7, 8]),
                description=f"A well-maintained {year} {bname} {model} sourced directly from Japan. "
                            f"Inspected and graded, with complete service history. Ideal for export — "
                            f"available FOB or CIF to your nearest port.",
                features="\n".join(random.sample(FEATURES, k=random.randint(5, 9))),
                featured=(i % 5 == 0), status="available",
                views_count=random.randint(0, 2400),
            )
            shots = random.sample(CAR_PHOTOS, k=random.randint(4, 6))
            for j, pid in enumerate(shots):
                CarImage.objects.create(car=car, image_url=unsplash(pid), is_primary=(j == 0), order=j)
            created_cars.append(car)
        self.stdout.write(self.style.SUCCESS(f"  {len(created_cars)} cars"))

        self.stdout.write("Creating parts & machines…")
        PRODUCTS = [
            ("Suzuki GSX-R750 Motorcycle", "GSX-R750", "Electric", 2800, "MOTORCYCLE"),
            ("Yamaha MT-09 Naked Bike", "MT-09", None, 5200, "MOTORCYCLE"),
            ("Honda CB400 Super Four", "CB400", None, 3400, "MOTORCYCLE"),
            ("Toyota 2JZ-GTE Engine", "2JZ-GTE", None, 4100, "Truck"),
            ("Nissan RB26DETT Engine", "RB26", None, 6800, "Truck"),
            ("Komatsu Mini Excavator", "PC30", None, 14500, "Truck"),
            ("Set of 4 Work Alloy Wheels 18\"", "Emotion CR", None, 1200, "SUV"),
            ("Recaro Sport Seats (Pair)", "SR-7", None, 1650, "Coupe"),
            ("Kawasaki Ninja ZX-6R", "ZX-6R", None, 6200, "MOTORCYCLE"),
            ("Toyota Forklift 2.5T", "8FG25", None, 9800, "Truck"),
        ]
        cats_for_products = {c.name: c for c in Category.objects.all()}
        Category.objects.get_or_create(name="MOTORCYCLE", defaults={"icon": "motorcycle"})
        cats_for_products = {c.name: c for c in Category.objects.all()}
        for idx, (name, model, _f, price, catname) in enumerate(PRODUCTS):
            p = Product.objects.create(
                stock_id=f"EMP{1000 + idx}", name=name, model=model,
                category=cats_for_products.get(catname),
                origin_country=countries["Japan"], price=price,
                condition=random.choice(["used", "used", "refurbished", "new"]),
                description=f"Quality used {name} imported from Japan. Tested and ready to ship.",
                specifications="Origin: Japan\nWarranty: 30 days\nShipping: Container",
                featured=(idx < 3), status="available", views_count=random.randint(0, 600),
            )
            pool = MOTO_PHOTOS if catname == "MOTORCYCLE" else MACHINE_PHOTOS
            shots = random.sample(pool, k=min(len(pool), random.randint(2, 4)))
            for j, pid in enumerate(shots):
                ProductImage.objects.create(product=p, image_url=unsplash(pid), is_primary=(j == 0), order=j)
        self.stdout.write(self.style.SUCCESS(f"  {len(PRODUCTS)} products"))

        self.stdout.write("Creating users…")
        admin = User.objects.filter(username="admin").first()
        if not admin:
            admin = User.objects.create_superuser("admin", "admin@extramileage.com", "admin12345")
            admin.first_name = "Site"; admin.last_name = "Admin"; admin.save()
        bidders = []
        for uname, full, country in [("kwame", "Kwame Mensah", "Ghana"), ("yuki", "Yuki Tanaka", "Japan"),
                                     ("priya", "Priya Sharma", "Fiji"), ("omar", "Omar Ali", "Tanzania"),
                                     ("john", "John Carter", "Jamaica")]:
            u = User.objects.filter(username=uname).first()
            if not u:
                first, last = full.split(" ", 1)
                u = User.objects.create_user(uname, f"{uname}@example.com", "demo12345",
                                             first_name=first, last_name=last, country=country)
            bidders.append(u)

        self.stdout.write("Creating auctions…")
        now = timezone.now()
        auction_cars = random.sample(created_cars, k=min(9, len(created_cars)))
        specs = [("live", -2, 1), ("live", -1, 2), ("live", -3, 1), ("live", -1, 3),
                 ("live", -2, 2), ("upcoming", 1, 4), ("upcoming", 2, 5), ("ended", -8, -1), ("ended", -10, -2)]
        for car, (state, start_off, end_off) in zip(auction_cars, specs):
            start = now + timedelta(days=start_off)
            end = now + timedelta(days=end_off, hours=random.randint(1, 20))
            starting = Decimal(int(car.price) - random.randint(2000, 6000))
            if starting < 1000:
                starting = Decimal("1000")
            a = Auction.objects.create(
                title=f"{car.year} {car.make} {car.model}", description=car.description,
                car=car, image_url=car.primary_image.url if car.primary_image else "",
                starting_price=starting, current_bid=starting,
                bid_increment=Decimal(random.choice([100, 250, 500])),
                start_date=start, end_date=end, featured=(state == "live"),
            )
            # simulate bid history
            cur = starting
            nbids = random.randint(0, 9) if state != "upcoming" else 0
            last_user = None
            for _ in range(nbids):
                cur = cur + a.bid_increment * random.randint(1, 3)
                last_user = random.choice(bidders)
                created = start + timedelta(hours=random.randint(0, 30))
                b = Bid.objects.create(auction=a, user=last_user, amount=cur)
                Bid.objects.filter(pk=b.pk).update(created=min(created, end))
            a.current_bid = cur
            a.save(update_fields=["current_bid"])
        self.stdout.write(self.style.SUCCESS(f"  {len(auction_cars)} auctions"))

        self.stdout.write("Creating testimonials & wishlists…")
        for i, (name, country, role, quote, rating) in enumerate(TESTIMONIALS):
            Testimonial.objects.get_or_create(name=name, defaults={
                "country": country, "role": role, "quote": quote, "rating": rating, "order": i})
        for u in bidders[:3]:
            for car in random.sample(created_cars, k=4):
                Wishlist.objects.get_or_create(user=u, car=car)

        # Hero slides (DB-driven, admin-editable)
        Slide.objects.all().delete()
        SLIDES = [
            ("Premium vehicles, direct from Japan",
             "Inspected, graded and shipped worldwide — transparent FOB & CIF pricing.",
             "Browse inventory", "/cars/", "1568844293986-8d0400bd4745"),
            ("New arrivals, every single day",
             "Fresh stock straight from Japanese auctions and dealer networks.",
             "See new arrivals", "/cars/?sort=newest", "1503376780353-7e6692767b70"),
            ("Bid live in the auction house",
             "Real-time bidding on hand-picked units — win below retail.",
             "Enter auctions", "/auctions/", "1605559424843-9e4c228bf1c2"),
            ("Parts, bikes & machines too",
             "Engines, motorcycles and equipment, shipped alongside your vehicle.",
             "Shop parts", "/parts/", "1568772585407-9361f9bf3a87"),
        ]
        for i, (t, s, btn, link, pid) in enumerate(SLIDES):
            Slide.objects.create(title=t, subtitle=s, button_text=btn, link=link,
                                 order=i, image_url=unsplash(pid), active=True)

        self.stdout.write(self.style.SUCCESS("\nDone. Login: admin / admin12345 — demo bidder: kwame / demo12345"))
