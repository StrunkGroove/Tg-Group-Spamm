from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('', include('main.urls')),
    path('accounts/', include('accounts.urls')),
    path('tg_accounts/', include('tg_accounts.urls')),

    path('admin/', admin.site.urls),
]
