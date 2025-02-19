from django.contrib import admin

from .models import User, Post, Like, Following

# Register your models here.
class UserAdmin(admin.ModelAdmin):
    list_display = ("username", "email", "password")


class PostAdmin(admin.ModelAdmin):
    list_display = ("author", "content", "timestamp")


class LikeAdmin(admin.ModelAdmin):
    list_display = ("post", "author")

class FollowingAdmin(admin.ModelAdmin):
    list_display = ("author", "following")


admin.site.register(User, UserAdmin)
admin.site.register(Post, PostAdmin)
admin.site.register(Like, LikeAdmin)
admin.site.register(Following, FollowingAdmin)