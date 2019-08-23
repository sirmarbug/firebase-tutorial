class Firebase {
    static setup() {
        const config = {
            apiKey: "AIzaSyD99vZty67HPl6nye87YrkZnUL3jg4-_SY",
            authDomain: "mychatapp-e3f36.firebaseapp.com",
            databaseURL: "https://mychatapp-e3f36.firebaseio.com",
            projectId: "mychatapp-e3f36",
            storageBucket: "mychatapp-e3f36.appspot.com",
            messagingSenderId: "1073126984320",
            appId: "1:1073126984320:web:fc67e917b31ab3a5"
        };

        firebase.initializeApp(config);
    }

    static addData() {
        firebase.database().ref(`blog/users/${firebase.auth().currentUser.uid}/movies`).on('child_added', data => {
            const movie = new Movie(data.val().title, data.val().rating, data.key);
            UI.addMovie(movie);
        });
    }

    static changeData() {
        firebase.database().ref(`blog/users/${firebase.auth().currentUser.uid}/movies`).on('child_changed', data => {
            UI.updateMovie(new Movie(data.val().title, data.val().rating, data.key));
        });
    }

    static deleteData() {
        firebase.database().ref(`blog/users/${firebase.auth().currentUser.uid}/movies`).on('child_removed', data => {
            UI.removeMovie(data.key);
        });
    }

    static addFavoriteMovie() {
        const movieTitle = document.getElementById('movieTitle').value;
        const movieRating = document.getElementById('movieRating').value;

        if (!movieTitle || !movieRating) {
            return;
        }

        const movie = new Movie(movieTitle, movieRating);

        firebase.database().ref(`blog/users/${firebase.auth().currentUser.uid}/movies`).push().set({
                title: movie.title,
                rating: movie.rating
            })
            .then(response => {
                document.getElementById('movieTitle').value = '';
                document.getElementById('movieRating').value = '0';
            })
            .catch(error => {
                showMessageAlert(error.message);
            });
    }

    static updateFavoriteMovie() {
        const title = document.getElementById('movieTitleEdit').value;
        const rating = document.getElementById('movieRatingEdit').value;

        if(!title || !rating) {
            return;
        }

        firebase.database().ref(`blog/users/${firebase.auth().currentUser.uid}/movies/${Modal.getID()}`).update({
                title,
                rating
            })
            .then(response => {
            })
            .catch(err => {
            });
    }

    static deleteFavoriteMovie() {
        if(!Modal.getID()) {
            return;
        }

        firebase.database().ref(`blog/users/${firebase.auth().currentUser.uid}/movies/${Modal.getID()}`).remove()
            .then(response => {
            })
            .catch(err => {
            });
    }
}

class User {
    constructor(login, password, repeatPassword) {
        this.login = login;
        this.password = password;
        this.repeatPassword = repeatPassword;
    }
}

class Movie {
    constructor(title, rating, key) {
        this.title = title;
        this.rating = rating;
        this.key = key;
    }
}

class Modal {
    static getID() {
        return sessionStorage.getItem('id');
    }

    static setID(id) {
        sessionStorage.setItem('id', id);
    }

    static modalHandler() {
        return document.getElementById('modal');
    }
    static editView() {
        return document.getElementById('editView');
    }
    static deleteView() {
        return document.getElementById('deleteView');
    }

    static showEditModal(title, rating, key) {
        Modal.setID(key);
        Modal.modalHandler().style.display = 'flex';
        Modal.editView().style.display = 'flex';
        document.getElementById('movieTitleEdit').value = title;
        document.getElementById('movieRatingEdit').value = rating;
    }

    static showDeleteModal(key) {
        Modal.setID(key);
        Modal.modalHandler().style.display = 'flex';
        Modal.deleteView().style.display = 'flex';
    }

    static hideModal() {
        Modal.modalHandler().style.display = 'none';
        Modal.editView().style.display = 'none';
        Modal.deleteView().style.display = 'none';
    }
}

class UI extends Modal {
    static authHeader() {
        return document.getElementById('authHeader');
    }
    static dashboardHeader() {
        return document.getElementById('dashboardHeader');
    }
    static loginView() {
        return document.getElementById('loginView');
    }
    static registerView() {
        return document.getElementById('registerView');
    }
    static dashboardView() {
        return document.getElementById('dashboardView');
    }
    static loginHeaderBtn() {
        return document.getElementById('loginHeaderBtn');
    }
    static registerHeaderBtn() {
        return document.getElementById('registerHeaderBtn');
    }

    static showLoginView() {
        UI.authHeader().style.display = 'flex';
        UI.dashboardHeader().style.display = 'none';
        UI.loginView().style.display = 'block';
        UI.registerView().style.display = 'none';
        UI.dashboardView().style.display = 'none';
        UI.loginHeaderBtn().classList.add('active');
        UI.registerHeaderBtn().classList.remove('active');
    }

    static showRegisterView() {
        UI.loginView().style.display = 'none';
        UI.registerView().style.display = 'block';
        UI.loginHeaderBtn().classList.remove('active');
        UI.registerHeaderBtn().classList.add('active');
    }

    static showDashboardView() {
        UI.authHeader().style.display = 'none';
        UI.dashboardHeader().style.display = 'flex';
        UI.loginView().style.display = 'none';
        UI.registerView().style.display = 'none';
        UI.dashboardView().style.display = 'block';
    }

    static updateUsername() {
        document.getElementById('user-name').innerText = firebase.auth().currentUser.email;
    }

    static showMessageAlert(msg) {
        const alert = document.getElementById('messageAlert');
        alert.innerText = msg;
        alert.style.display = 'block';
    }

    static hideMessageAlert() {
        const alert = document.getElementById('messageAlert');
        alert.innerText = '';
        alert.style.display = 'none';
    }

    static clearLoginFields() {
        document.getElementById('loginMailInput').value = '';
        document.getElementById('loginPasswordInput').value = '';
    }

    static clearRegisterFields() {
        document.getElementById('registerMailInput').value = '';
        document.getElementById('registerPasswordInput').value = '';
        document.getElementById('registerRepeatPasswordInput').value = '';
    }

    static addMovie(movie) {
        const li = document.createElement('li');
        li.setAttribute('id', `m${movie.key}`);
        li.innerHTML = `
            <div>${movie.title}</div>
            <div>${movie.rating}</div>
            <div>
                <i class="fa fa-pencil-square-o mr-2" aria-hidden="true" onclick="UI.showEditModal('${movie.title}', ${movie.rating}, '${movie.key}')"></i>
                <i class="fa fa-trash" aria-hidden="true" onclick="UI.showDeleteModal('${movie.key}')"></i>
            </div>
        `;
        document.getElementById('movieList').appendChild(li);
    }

    static updateMovie(movie) {
        const li = document.getElementById(`m${movie.key}`);
        li.innerHTML = `
            <div>${movie.title}</div>
            <div>${movie.rating}</div>
            <div>
                <i class="fa fa-pencil-square-o mr-2" aria-hidden="true" onclick="UI.showEditModal('${movie.title}', ${movie.rating}, '${movie.key}')"></i>
                <i class="fa fa-trash" aria-hidden="true" onclick="UI.showDeleteModal('${movie.key}')"></i>
            </div>
        `;
    }

    static removeMovie(key) {
        const movie = document.getElementById(`m${key}`);
        movie.parentNode.removeChild(movie);
    }
}

Firebase.setup();

document.addEventListener('DOMContentLoaded', () => {
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            UI.updateUsername();
            UI.showDashboardView();
            Firebase.addData();
            Firebase.changeData();
            Firebase.deleteData();
        } else {
            UI.showLoginView();
        }
    });
});

document.getElementById('loginHeaderBtn').addEventListener('click', () => {
    UI.showLoginView();
});

document.getElementById('registerHeaderBtn').addEventListener('click', () => {
    UI.showRegisterView();
});

document.getElementById('registerBtn').addEventListener('click', event => {
    event.preventDefault();

    const login = document.getElementById('registerMailInput').value;
    const passwd = document.getElementById('registerPasswordInput').value;
    const repasswd = document.getElementById('registerRepeatPasswordInput').value;

    const user = new User(login, passwd, repasswd);

    if (!user.login || !user.password || !user.repeatPassword) {
        UI.showMessageAlert('Wypełnij pola');
        return;
    }
    if (user.password !== user.repeatPassword) {
        UI.showMessageAlert('Hasła różnią się');
        return;
    }
    firebase.auth().createUserWithEmailAndPassword(user.login, user.password)
        .then(response => {
            UI.hideMessageAlert();
            UI.clearRegisterFields();
        })
        .catch(error => {
            UI.showMessageAlert(error.message);
        });
});

document.getElementById('loginBtn').addEventListener('click', event => {
    event.preventDefault();

    const login = document.getElementById('loginMailInput').value;
    const passwd = document.getElementById('loginPasswordInput').value;

    const user = new User(login, passwd, null);

    if (!user.login || !user.password) {
        UI.showMessageAlert('Wypełnij pola');
        return;
    }
    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION)
        .then(() => {
            return firebase.auth().signInWithEmailAndPassword(user.login, user.password)
                .then(response => {
                    UI.clearLoginFields();
                    UI.hideMessageAlert();
                    UI.updateUsername();
                });
        })
        .catch(function (error) {
            UI.showMessageAlert(error.message);
        });
});

document.getElementById('dashboardSignOutBtn').addEventListener('click', e => {
    e.preventDefault();

    firebase.auth().signOut()
        .then(response => {
            UI.hideMessageAlert();
        })
        .catch(error => {
            UI.showMessageAlert(error.message);
        });
});

document.getElementById('movieAddBtn').addEventListener('click', e => {
    Firebase.addFavoriteMovie();
});

document.getElementById('editConfirmBtn').addEventListener('click', e => {
    Firebase.updateFavoriteMovie();
    UI.hideModal();
});

document.getElementById('editCloseBtn').addEventListener('click', e => {
    UI.hideModal();
});

document.getElementById('deleteConfirmBtn').addEventListener('click', e => {
    Firebase.deleteFavoriteMovie();
    UI.hideModal();
});

document.getElementById('deleteCloseBtn').addEventListener('click', e => {
    UI.hideModal();
});