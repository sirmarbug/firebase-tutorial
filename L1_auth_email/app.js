class FirebaseConfig {
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
}

class User {
    constructor(login, password, repeatPassword) {
        this.login = login;
        this.password = password;
        this.repeatPassword = repeatPassword;
    }
}

class UI {
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
}

FirebaseConfig.setup();

document.addEventListener('DOMContentLoaded', () => {
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            UI.updateUsername();
            UI.showDashboardView();
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
    // firebase.auth().signInWithEmailAndPassword(user.login, user.password)
    //     .then(response => {
    //         UI.clearLoginFields();
    //         UI.hideMessageAlert();
    //         UI.updateUsername();
    //     })
    //     .catch((error) => {
    //         UI.showMessageAlert(error.message);
    //     });
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