
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("following", views.following_view, name="following"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("profile/<str:username>", views.profile_view, name="profile"),

    # API requests URLs
    path("newPost", views.newPost, name="newPost"),
    path("posts/<str:type>", views.posts, name="posts"),
    path("profileInfo/<str:username>", views.profileInfo, name="profileInfo"),
    path("follow/<str:following>", views.follow, name="follow"),
    path("edit", views.edit, name="edit"),
    path("like/<int:post>", views.like, name="like")
]
