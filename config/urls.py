from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

admin.site.site_header = "Extra Mileage Logistics — Admin"
admin.site.site_title = "Extra Mileage Admin"
admin.site.index_title = "Marketplace administration"

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("api.urls")),
    path("", include("core.urls")),
    path("cars/", include("catalog.urls")),
    path("parts/", include("shop.urls")),
    path("auctions/", include("auctions.urls")),
    path("account/", include("accounts.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.BASE_DIR / "static")
