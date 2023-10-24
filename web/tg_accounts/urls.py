from django.urls import path
from .views import (
    UsernameUpdateServerView, RequireUserView, RequireUserDeleteView, UsernameCreateView, UsernameUpdateView, UsernameDeleteView, UsernameStartView, DownloadView
)


urlpatterns = [
    path('users/', RequireUserView.as_view(), name='list'),
    path('users/delete/', RequireUserDeleteView.as_view()),

    path('index/create/', UsernameCreateView.as_view()),
    path('index/update_text/', UsernameUpdateView.as_view()),
    path('index/update_server/', UsernameUpdateServerView.as_view()),
    path('index/delete/', UsernameDeleteView.as_view()),
    path('index/start/', UsernameStartView.as_view()),
    path('index/download/', DownloadView.as_view()),
]