from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.http import HttpResponse

FRONTEND_INDEX = settings.WHITENOISE_ROOT / "index.html"


def spa_view(request):
    return HttpResponse(FRONTEND_INDEX.read_text(), content_type="text/html")


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/', include('wardrobe.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

urlpatterns += [
    re_path(r"^(?!api/|admin/|static/|media/).*$", spa_view),
]
