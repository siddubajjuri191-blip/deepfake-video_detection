from django.urls import path, include

urlpatterns = [
    path("api/", include("ml_app.urls")),
]
