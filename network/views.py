import json
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django import forms
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.core.paginator import Paginator

from .models import User, Post, Like, Following


def index(request):
    return render(request, "network/index.html")


def following_view(request):
    return render(request, "network/following.html")


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")
    

@csrf_exempt
@login_required
def newPost(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST request required"}, status=400)
    
    data = json.loads(request.body)

    author = request.user
    content = data.get("content", "")

    if content == "":
        return JsonResponse({"error": "Post content missing!"}, status=400)
    
    if len(content) > 500:
        return JsonResponse({"error": "Post exceeding max length!"}, status=400)
    
    post = Post(author=author, content=content)
    post.save()

    return JsonResponse({"message": "New post created!"}, status=201)


@csrf_exempt
def posts(request, type):
    try:
        likedPosts = Like.objects.all().filter(author=User.objects.get(username=request.user))
        likedPostsList = [likedPost.serialize() for likedPost in likedPosts]
    except:
        likedPostsList = False
    
    if request.method == "POST":
        if type == "profile":

            data = json.loads(request.body)

            username = data.get("username", "")
            
            try:
                posts = Post.objects.filter(author=User.objects.get(username=username)).order_by('-timestamp').all()
            except:
                return JsonResponse({"error": "Posts not found!"}, status=404)
            
            postSerialized = [post.serialize() for post in posts]

            p = Paginator(postSerialized, 10)
            page = p.page(int(request.GET.get('page')))

            return JsonResponse({"loggedUser": request.user.username, "numOfPages": p.num_pages, "previous": page.has_previous(), "next": page.has_next(), "likedPosts": likedPostsList, "posts": page.object_list}, safe=False)
    else:
        if type == "all":
            try:
                posts = Post.objects.order_by('-timestamp').all()
            except:
                return JsonResponse({"error": "Posts not found!"}, status=404)
            
            postSerialized = [post.serialize() for post in posts]

            p = Paginator(postSerialized, 10)
            page = p.page(int(request.GET.get('page')))

            return JsonResponse({"loggedUser": request.user.username, "numOfPages": p.num_pages, "previous": page.has_previous(), "next": page.has_next(), "likedPosts": likedPostsList, "posts": page.object_list}, safe=False)
        

        elif type == "following":
            posts = Post.objects.all().filter(author__in=Following.objects.filter(author=request.user).values("following")).order_by('-timestamp')
            
            if not posts:
                return JsonResponse({"error": "Following not found!"}, status=404)
            
            postSerialized = [post.serialize() for post in posts]

            p = Paginator(postSerialized, 10)
            page = p.page(int(request.GET.get('page')))

            return JsonResponse({"loggedUser": request.user.username, "numOfPages": p.num_pages, "previous": page.has_previous(), "next": page.has_next(), "likedPosts": likedPostsList, "posts": page.object_list}, safe=False)
        else:
            return JsonResponse({"error": "Invalid posts type!"}, status=400)
    

def profile_view(request, username):
    return render(request, "network/profile.html")


def profileInfo(request, username):
    try:
        user = User.objects.get(username=username)
    except:
        return JsonResponse({"error": "User not found!"}, status=404)
    
    try:
        isFollowing = Following.objects.get(author=User.objects.get(username=request.user), following=User.objects.get(username=username))
        isFollowing = "true"
    except:
        isFollowing = "false"
    
    following = Following.objects.filter(author=user).count()
    followers = Following.objects.filter(following=user).count()

    return JsonResponse({"user": f"{user}","requestUser": f"{request.user}", "following": f"{following}", "followers": f"{followers}", "isFollowing": f"{isFollowing}"}, safe=False)


@csrf_exempt
def follow(request, following):
    try:
        isFollowing = Following.objects.get(author=User.objects.get(username=request.user), following=User.objects.get(username=following))
    except:
        isFollowing = None

    if not isFollowing:
        Following(author=User.objects.get(username=request.user), following=User.objects.get(username=following)).save()
    else:
        Following.objects.filter(author=User.objects.get(username=request.user), following=User.objects.get(username=following)).delete()

    return JsonResponse({"status": "Sucess!"})


@csrf_exempt
def edit(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST request required"}, status=400)
    
    data = json.loads(request.body)
    id = int(data.get("id", ""))
    newContent = data.get("newContent", "")

    if newContent == "":
        return JsonResponse({"error": "Post content missing!"}, status=400)
    
    if len(newContent) > 500:
        return JsonResponse({"error": "Post exceeding max length!"}, status=400)
    
    Post.objects.filter(id=id).update(content=newContent)

    return JsonResponse({"message": "Post updated!"}, status=201)


@csrf_exempt
def like(request, post):
    try:
        isLiked = Like.objects.get(post=Post.objects.get(id=post), author=User.objects.get(username=request.user))
    except:
        isLiked = None

    if not isLiked:
        Like(post=Post.objects.get(id=post), author=User.objects.get(username=request.user)).save()
        likeCount = int(Post.objects.get(id=post).likeCount) + 1
        Post.objects.filter(id=post).update(likeCount=likeCount)

        return JsonResponse({"method": "like"})
    
    else:
        Like.objects.filter(post=Post.objects.get(id=post), author=User.objects.get(username=request.user)).delete()
        likeCount = int(Post.objects.get(id=post).likeCount) - 1
        Post.objects.filter(id=post).update(likeCount=likeCount)

        return JsonResponse({"method": "unlike"})