let editBtn = ``;
let page = 1;
document.addEventListener('DOMContentLoaded', function() {
    const currentPath = window.location.pathname;
    
    document.querySelector('#followBtnC')?.addEventListener('click', () => followUser());
    document.querySelector('#likeBtn')?.addEventListener('click', () => likePost());
    document.querySelector('#pageBtn')?.addEventListener('click', () => pageIncrement());

    if (document.querySelector('#newPost')) {
        document.querySelector('#newPost').onsubmit = () => {
            content = document.querySelector('#postDescription').value

            fetch('/newPost', {
                method: 'POST',
                body: JSON.stringify({
                    content: content
                })
            })
            .then(response => response.json())
            .then(result => {
                console.log(result);
            })
            .then(() => load_posts('all'))
            .then(() => {
                document.querySelector('#postDescription').value = "";
            })
            .then(() => charLength());
            
            return false;
        }
    }

    page = 1;
    if (currentPath === '/') {
        load_posts('all');
        if (document.querySelector('#newPost')) {
            charLength();
        }
    }
    else if (currentPath === "/following") {
        load_posts('following')
    }
    else if (currentPath.startsWith("/profile")) {
        load_profile();
        load_posts('profile');
    }
});

function load_posts(type) {

    document.querySelector('#posts').innerHTML = '';

    if (type === "profile") {
        fetch(`/posts/profile?page=${page}`, {
            method: 'POST',
            body: JSON.stringify({
                "username": window.location.pathname.split('/')[2]
            })
        })
        .then(response => response.json())
        .then(posts => {

            likeBtn = ``

            for (let i = 0; i < posts.posts.length; i++) {
                console.log(posts.posts[i])
                if (posts.loggedUser) {
                    likeBtn = `<button type="button" class="btn btn-norm btn-sm likeBtn" id="likeBtn${posts.posts[i]['id']}" onclick="likePost(${posts.posts[i]['id']})">❤️ <p id="likeCount${posts.posts[i]['id']}" style="display: inline;">${posts.posts[i]['likeCount']}</p></button>`
                }
                if (document.querySelector('#loggedUser')?.innerHTML == posts.posts[i]['author']) {
                    editBtn = `<button type="button" class="btn btn-secondary btn-edit-sm" id="editBtn${posts.posts[i]['id']}" onclick="editPost(${posts.posts[i]['id']})">&#9998;</button>`;
                }
                else {
                    editBtn = ``
                }
                document.querySelector('#posts').innerHTML += `<div class="card mt-2"> <div class="card-body"> <div class="row"><div class="col"><h5 class="card-title"><a href="/profile/${posts.posts[i]['author']}" id="profileLink">${posts.posts[i]['author']}</a></h5></div><div class="col text-right">` + editBtn + `</div></div> <div class="mb-3" id="postContent${posts.posts[i]['id']}"><p class="card-text" id="postContentDesc${posts.posts[i]['id']}">${posts.posts[i]['content']}</p></div>` + likeBtn + `<p class="card-text mt-2"><small class="text-muted p">${posts.posts[i]['timestamp']}</small></p> </div> </div>`;
            }

            if (posts.numOfPages > 1) {
                document.querySelector('#paginateNav').innerHTML = `<nav aria-label="Page navigation example"> <ul class="pagination justify-content-center"> </ul> </nav>`;
                document.querySelector('.pagination').innerHTML += `<li class="page-item"> <button class="page-link" id="previous" onClick="pageIncrement('previous', 'profile')">Previous</button> </li>`;

                for (let i = 1; i <= posts.numOfPages; i++) {
                    document.querySelector('.pagination').innerHTML += `<li class="page-item page${i}"><button class="page-link" id="pageBtn" onClick="pageIncrement('${i}', 'profile')">${i}</button></li>`;
                }

                document.querySelector('.pagination').innerHTML += `<li class="page-item"> <button class="page-link" id="next" onClick="pageIncrement('next', 'profile')">Next</button> </li>`;
                document.querySelector(`.page${page}`).classList.add('active');

                if (!posts.previous) {
                    document.querySelector('#previous').classList.add('btn-disable');
                    document.querySelector('#previous').disabled = true;
                }

                if (!posts.next) {
                    document.querySelector('#next').classList.add('btn-disable');
                    document.querySelector('#next').disabled = true;
                }
            }
            
            for (let i = 0; i < posts.likedPosts.length; i++) {
                document.querySelector(`#likeBtn${posts.likedPosts[i].post}`)?.classList.add('btn-liked')
                document.querySelector(`#likeBtn${posts.likedPosts[i].post}`)?.classList.remove('btn-norm')
            }
        })
        .catch(error => {
            if (error.message === "Post not found!") {
                console.log(error.message);
                document.querySelector('#posts').innerHTML = '<h4>No Posts From following!</h4>';
            }
        });
    }
    else if (type === 'all') {

        if (document.querySelector('.newPostForm')) {
            document.querySelector('.newPostForm').style.display = 'block';
        }

        fetch(`/posts/all?page=${page}`)
        .then(response => response.json())
        .then(posts => {
            console.log(posts);

            likeBtn = ``

            for (let i = 0; i < posts.posts.length; i++) {
                console.log(posts.posts[i])
                if (posts.loggedUser) {
                    likeBtn = `<button type="button" class="btn btn-norm btn-sm likeBtn" id="likeBtn${posts.posts[i]['id']}" onclick="likePost(${posts.posts[i]['id']})">❤️ <p id="likeCount${posts.posts[i]['id']}" style="display: inline;">${posts.posts[i]['likeCount']}</p></button>`
                }
                if (document.querySelector('#loggedUser')?.innerHTML == posts.posts[i]['author']) {
                    editBtn = `<button type="button" class="btn btn-secondary btn-edit-sm" id="editBtn${posts.posts[i]['id']}" onclick="editPost(${posts.posts[i]['id']})">&#9998;</button>`;
                }
                else {
                    editBtn = ``
                }
                document.querySelector('#posts').innerHTML += `<div class="card mt-2"> <div class="card-body"> <div class="row"><div class="col"><h5 class="card-title"><a href="/profile/${posts.posts[i]['author']}" id="profileLink">${posts.posts[i]['author']}</a></h5></div><div class="col text-right">` + editBtn + `</div></div> <div class="mb-3" id="postContent${posts.posts[i]['id']}"><p class="card-text" id="postContentDesc${posts.posts[i]['id']}">${posts.posts[i]['content']}</p></div>` + likeBtn + `<p class="card-text mt-2"><small class="text-muted p">${posts.posts[i]['timestamp']}</small></p> </div> </div>`;
            }

            if (posts.numOfPages > 1) {
                document.querySelector('#paginateNav').innerHTML = `<nav aria-label="Page navigation example"> <ul class="pagination justify-content-center"> </ul> </nav>`;
                document.querySelector('.pagination').innerHTML += `<li class="page-item"> <button class="page-link" id="previous" onClick="pageIncrement('previous', 'all')">Previous</button> </li>`;

                for (let i = 1; i <= posts.numOfPages; i++) {
                    document.querySelector('.pagination').innerHTML += `<li class="page-item page${i}"><button class="page-link" id="pageBtn" onClick="pageIncrement('${i}', 'all')">${i}</button></li>`;
                }

                document.querySelector('.pagination').innerHTML += `<li class="page-item"> <button class="page-link" id="next" onClick="pageIncrement('next', 'all')">Next</button> </li>`;
                document.querySelector(`.page${page}`).classList.add('active');

                if (!posts.previous) {
                    document.querySelector('#previous').classList.add('btn-disable');
                    document.querySelector('#previous').disabled = true;
                }

                if (!posts.next) {
                    document.querySelector('#next').classList.add('btn-disable');
                    document.querySelector('#next').disabled = true;
                }
            }

            for (let i = 0; i < posts.likedPosts.length; i++) {
                document.querySelector(`#likeBtn${posts.likedPosts[i].post}`)?.classList.add('btn-liked')
                document.querySelector(`#likeBtn${posts.likedPosts[i].post}`)?.classList.remove('btn-norm')
            }

        })
        .catch(error => {
            if (error.message === "Post not found!") {
                console.log(error.message);
                document.querySelector('#posts').innerHTML = '<h4>No Posts From following!</h4>';
            }
        });
    }
    else if (type === 'following') {

        fetch(`/posts/following?page=${page}`)
        .then(response => response.json())
        .then(posts => {

            likeBtn = ``

            for (let i = 0; i < posts.posts.length; i++) {
                console.log(posts.posts[i])
                if (posts.loggedUser) {
                    likeBtn = `<button type="button" class="btn btn-norm btn-sm likeBtn" id="likeBtn${posts.posts[i]['id']}" onclick="likePost(${posts.posts[i]['id']})">❤️ <p id="likeCount${posts.posts[i]['id']}" style="display: inline;">${posts.posts[i]['likeCount']}</p></button>`
                }
                if (document.querySelector('#loggedUser')?.innerHTML == posts.posts[i]['author']) {
                    editBtn = `<button type="button" class="btn btn-secondary btn-edit-sm" id="editBtn${posts.posts[i]['id']}" onclick="editPost(${posts.posts[i]['id']})">&#9998;</button>`;
                }
                else {
                    editBtn = ``
                }
                document.querySelector('#posts').innerHTML += `<div class="card mt-2"> <div class="card-body"> <div class="row"><div class="col"><h5 class="card-title"><a href="/profile/${posts.posts[i]['author']}" id="profileLink">${posts.posts[i]['author']}</a></h5></div><div class="col text-right">` + editBtn + `</div></div> <div class="mb-3" id="postContent${posts.posts[i]['id']}"><p class="card-text" id="postContentDesc${posts.posts[i]['id']}">${posts.posts[i]['content']}</p></div>` + likeBtn + `<p class="card-text mt-2"><small class="text-muted p">${posts.posts[i]['timestamp']}</small></p> </div> </div>`;
            }

            if (posts.numOfPages > 1) {
                document.querySelector('#paginateNav').innerHTML = `<nav aria-label="Page navigation example"> <ul class="pagination justify-content-center"> </ul> </nav>`;
                document.querySelector('.pagination').innerHTML += `<li class="page-item"> <button class="page-link" id="previous" onClick="pageIncrement('previous', 'following')">Previous</button> </li>`;

                for (let i = 1; i <= posts.numOfPages; i++) {
                    document.querySelector('.pagination').innerHTML += `<li class="page-item page${i}"><button class="page-link" id="pageBtn" onClick="pageIncrement('${i}', 'following')">${i}</button></li>`;
                }

                document.querySelector('.pagination').innerHTML += `<li class="page-item"> <button class="page-link" id="next" onClick="pageIncrement('next', 'following')">Next</button> </li>`;
                document.querySelector(`.page${page}`).classList.add('active');

                if (!posts.previous) {
                    document.querySelector('#previous').classList.add('btn-disable');
                    document.querySelector('#previous').disabled = true;
                }

                if (!posts.next) {
                    document.querySelector('#next').classList.add('btn-disable');
                    document.querySelector('#next').disabled = true;
                }
            }

            for (let i = 0; i < posts.likedPosts.length; i++) {
                document.querySelector(`#likeBtn${posts.likedPosts[i].post}`)?.classList.add('btn-liked')
                document.querySelector(`#likeBtn${posts.likedPosts[i].post}`)?.classList.remove('btn-norm')
            }

        })
        .catch(error => {
            if (error.message === "Following not found!") {
              console.log(error.message);
              document.querySelector('#posts').innerHTML = '<h4>No accounts followed!</h4>';
            }
            else if (error.message === "Post not found!") {
                console.log(error.message);
                document.querySelector('#posts').innerHTML = '<h4>No Posts From following!</h4>';
            }
        });
    }
}

function load_profile() {
    fetch(`/profileInfo/${window.location.pathname.split('/')[2]}`)
    .then(response => response.json())
    .then(profileInfo => {
        document.querySelector('#user').innerHTML = profileInfo.user;
        document.querySelector('#followersNum').innerHTML = profileInfo.followers;
        document.querySelector('#followingNum').innerHTML = profileInfo.following;
        
        if (profileInfo.isFollowing === "true") {
            document.querySelector('#followBtnC').innerHTML = 'Unfollow';
        }
        else if (profileInfo.user === profileInfo.requestUser) {
            document.querySelector('#followBtnC').disabled = true;
            document.querySelector('#followBtnC').classList.add('btn-disable');
            document.querySelector('#followBtnC').innerHTML = 'Follow';
        }
        else {
            document.querySelector('#followBtnC').innerHTML = 'Follow';
        }
    });
}

function followUser() {
    fetch(`/follow/${window.location.pathname.split('/')[2]}`)
    .then(() => load_profile());
}

function likePost(postID) {
    fetch(`/like/${postID}`)
    .then(response => response.json())
    .then(like => {
        if (like.method == "like") {
            likeCount = parseInt(document.querySelector(`#likeCount${postID}`).innerHTML) + 1
            document.querySelector(`#likeCount${postID}`).innerHTML = likeCount
            document.querySelector(`#likeBtn${postID}`).classList.add('btn-liked')
            document.querySelector(`#likeBtn${postID}`).classList.remove('btn-norm')
        }
        else {
            likeCount = parseInt(document.querySelector(`#likeCount${postID}`).innerHTML) - 1
            document.querySelector(`#likeCount${postID}`).innerHTML = likeCount
            document.querySelector(`#likeBtn${postID}`).classList.add('btn-norm')
            document.querySelector(`#likeBtn${postID}`).classList.remove('btn-liked')
        }
    })
}

function pageIncrement(btnClicked, type) {

    if (btnClicked === "previous") {
        page--
    }
    else if (btnClicked === "next") {
        page++
    }
    else {
        page = parseInt(btnClicked)
    }

    load_posts(type)
}

function charLength() {
    document.querySelector('#charlength').innerHTML = document.querySelector('#postDescription').value.length;
}

function editPost(id) {
    document.querySelector(`#editBtn${id}`).style.display = 'none'
    postContent = document.querySelector(`#postContentDesc${id}`).innerHTML
    document.querySelector(`#postContent${id}`).innerHTML = `<form id="editForm" class="${id}"> <textarea class="form-control" id="postContentEdited" rows="2" required placeholder="Adjusted content goes here!" maxlength="500" oninput="charLength()">${postContent}</textarea> <input type="submit" class="btn btn-primary btn-sm mt-2" value="Save"> </form>`
    
    document.querySelector('#editForm').onsubmit = () => {
        newContent = document.querySelector('#postContentEdited').value
        id = document.querySelector('#editForm').classList[0]
        
        fetch('/edit', {
            method: 'POST',
            body: JSON.stringify({
                id: id,
                newContent: newContent
            })
        })
        .then(response => response.json())
        .then(result => {
            console.log(result);
        })
        .then(() => {
            document.querySelector(`#postContent${id}`).innerHTML = `<p class="card-text" id="postContentDesc${id}">${newContent}</p>`
            document.querySelector(`#editBtn${id}`).style.display = 'inline'
        })
        
        return false;
    }
}