import json
from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    pass


class Post(models.Model):
    author = models.ForeignKey("User", on_delete=models.CASCADE, related_name="postAuthor")
    content = models.TextField(max_length=500)
    timestamp = models.DateTimeField(auto_now_add=True)
    likeCount = models.IntegerField(default=0)

    def serialize(self):
        return {
            "id": self.id,
            "author": self.author.username,
            "content": self.content,
            "timestamp": self.timestamp.strftime("%b %d %Y, %I:%M %p"),
            "likeCount": self.likeCount
        }


class Like(models.Model):
    post = models.ForeignKey("Post", on_delete=models.CASCADE, related_name="postLike")
    author = models.ForeignKey("User", on_delete=models.CASCADE, related_name="likeAuthor")

    def serialize(self):
        return {
            "post": self.post.id,
            "author": self.author.username
        }


class Following(models.Model):
    author = models.ForeignKey("User", on_delete=models.CASCADE, related_name="follower")
    following = models.ForeignKey("User", on_delete=models.CASCADE, related_name="followee")