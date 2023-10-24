from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('user_for_spamm/', views.username, name='username'),
    path('instructions/', views.instructions, name='instructions'),
    path('block/', views.block, name='block'),
]
