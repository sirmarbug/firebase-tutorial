class Firebase {
    static setup() {
        const config = {
            apiKey: "",
            authDomain: "",
            databaseURL: "",
            projectId: "",
            storageBucket: "",
            messagingSenderId: "",
            appId: ""
        };

        firebase.initializeApp(config);
    }

    static getData() {
        firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid).collection('movies').onSnapshot(querySnapshot => {
            UI.resetList();
            querySnapshot.forEach((doc) => {
                const movie = new Movie(doc.data().title, doc.data().rating, doc.id);
                UI.addMovie(movie);
            });
        });
    }

    static addFavoriteMovie() {
        const movieTitle = document.getElementById('movieTitle').value;
        const movieRating = document.getElementById('movieRating').value;

        if (!movieTitle || !movieRating) {
            return;
        }

        const movie = new Movie(movieTitle, movieRating);

        firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid).collection('movies').add({
            title: movie.title,
            rating: movie.rating
        })
            .then(response => {
                document.getElementById('movieTitle').value = '';
                document.getElementById('movieRating').value = '0';
            })
            .catch(error => {
                console.log(error.message);
            });
    }

    static updateFavoriteMovie() {
        const title = document.getElementById('movieTitleEdit').value;
        const rating = document.getElementById('movieRatingEdit').value;

        if(!title || !rating) {
            return;
        }

        firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid).collection('movies').doc(Modal.getID())
        .update({
            title,
            rating
        })
            .then(response => {
            })
            .catch(error => {
                console.log(error.message);
            });
    }

    static deleteFavoriteMovie() {
        if(!Modal.getID()) {
            return;
        }

        firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid).collection('movies').doc(Modal.getID()).delete()
            .then(response => {
            })
            .catch(error => {
                console.log(error.message);
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
        UI.changeClass(Modal.modalHandler(), 'd-flex', 'd-none');
        UI.changeClass(Modal.editView(), 'd-flex', 'd-none');
        document.getElementById('movieTitleEdit').value = title;
        document.getElementById('movieRatingEdit').value = rating;
    }

    static showDeleteModal(key) {
        Modal.setID(key);
        UI.changeClass(Modal.modalHandler(), 'd-flex', 'd-none');
        UI.changeClass(Modal.deleteView(), 'd-flex', 'd-none');
    }

    static hideModal() {
        UI.changeClass(Modal.modalHandler(), 'd-none', 'd-flex');
        UI.changeClass(Modal.editView(), 'd-none', 'd-flex');
        UI.changeClass(Modal.deleteView(), 'd-none', 'd-flex');
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
        UI.changeClass(UI.authHeader(), 'd-flex', 'd-none');
        UI.changeClass(UI.dashboardHeader(), 'd-none', 'd-flex');
        UI.changeClass(UI.loginView(), 'd-block', 'd-none');
        UI.changeClass(UI.registerView(), 'd-none', 'd-block');
        UI.changeClass(UI.dashboardView(), 'd-none', 'd-block');
        UI.loginHeaderBtn().classList.add('active');
        UI.registerHeaderBtn().classList.remove('active');
    }

    static showRegisterView() {
        UI.changeClass(UI.loginView(), 'd-none', 'd-block');
        UI.changeClass(UI.registerView(), 'd-block', 'd-none');
        UI.loginHeaderBtn().classList.remove('active');
        UI.registerHeaderBtn().classList.add('active');
    }

    static showDashboardView() {
        UI.changeClass(UI.authHeader(), 'd-none', 'd-flex');
        UI.changeClass(UI.dashboardHeader(), 'd-flex', 'd-none');
        UI.changeClass(UI.loginView(), 'd-none', 'd-block');
        UI.changeClass(UI.registerView(), 'd-none', 'd-block');
        UI.changeClass(UI.dashboardView(), 'd-block', 'd-none');
    }

    static updateUsername() {
        document.getElementById('user-name').innerText = firebase.auth().currentUser.email;
    }

    static showMessageAlert(msg) {
        const alert = document.getElementById('messageAlert');
        alert.innerText = msg;
        UI.changeClass(alert, 'd-block', 'd-none');
    }

    static hideMessageAlert() {
        const alert = document.getElementById('messageAlert');
        alert.innerText = '';
        UI.changeClass(alert, 'd-none', 'd-block');
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

    static resetList() {
        document.getElementById('movieList').innerHTML = '';
    }

    // Utils
    static changeClass(elem, add, remove) {
        const el = elem;
        el.classList.remove(remove);
        el.classList.add(add);
        return el;
    }
}

Firebase.setup();

document.addEventListener('DOMContentLoaded', () => {
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            UI.updateUsername();
            UI.showDashboardView();
            Firebase.getData();
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
            UI.resetList();
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