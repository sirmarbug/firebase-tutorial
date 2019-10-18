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

    static getFiles() {
        const fileRef = firebase.storage().ref(`users/${firebase.auth().currentUser.uid}`);
        fileRef.listAll().then(function (res) {
            res.items.forEach(function (itemRef) {
                const file = new File(itemRef.name, itemRef.fullPath);
                UI.addFileToHTML(file);
            });
        }).catch(function (error) {
            console.log(error);
        });
    }

    static uploadFile(file) {
        const fileRef = firebase.storage().ref(`users/${firebase.auth().currentUser.uid}/${file.name}`);
        const uploadTask = fileRef.put(file);
        uploadTask.on('state_changed', snapshot => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                UI.updateProgressbar(progress);
            },
            error => {
                console.log(error);
            },
            success => {
                const file = new File(uploadTask.snapshot.metadata.name, uploadTask.snapshot.metadata.fullPath);
                UI.addFileToHTML(file);
                UI.resetProgressbar();
            });
    }

    static previewFile(path) {
        firebase.storage().ref(path).getDownloadURL().then(url => UI.setImg(url));
    }

    static deleteFile() {
        if (!UI.getID()) {
            return;
        }

        firebase.storage().ref(UI.getID()).delete()
            .then(res => {
                UI.removeFile(UI.getID());
            })
            .catch(function (error) {
                console.log('Blad', error);
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

class File {
    constructor(name, fullPath) {
        this.name = name;
        this.fullPath = fullPath;
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
    static previewView() {
        return document.getElementById('previewView');
    }
    static deleteView() {
        return document.getElementById('deleteView');
    }

    static showPreviewModal(path) {
        UI.changeClass(Modal.modalHandler(), 'd-flex', 'd-none');
        UI.changeClass(Modal.previewView(), 'd-flex', 'd-none');
        Firebase.previewFile(path);
    }

    static showDeleteModal(path) {
        UI.setID(path);
        UI.changeClass(Modal.modalHandler(), 'd-flex', 'd-none');
        UI.changeClass(Modal.deleteView(), 'd-flex', 'd-none');
    }

    static hideModal() {
        UI.changeClass(Modal.modalHandler(), 'd-none', 'd-flex');
        UI.changeClass(Modal.previewView(), 'd-none', 'd-flex');
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

    static addFileToHTML(file) {
        const li = document.createElement('li');
        li.setAttribute('id', `${file.fullPath}`);
        li.innerHTML = `
        <div class="fileList-name">${file.name}</div>
        <div class="fileList-options">
            <i class="fa fa-search mr-2" onclick="UI.showPreviewModal('${file.fullPath}')"></i>
            <i class="fa fa-trash" aria-hidden="true" onclick="UI.showDeleteModal('${file.fullPath}')"></i>
        </div>
        `;
        document.getElementById('filesList').appendChild(li);
    }

    static removeFile(fullPath) {
        const file = document.getElementById(`${fullPath}`);
        file.parentNode.removeChild(file);
    }

    static setImg(src) {
        document.getElementById('previewView-img').src = src;
    }

    static resetImg() {
        document.getElementById('previewView-img').src = '';
    }

    static resetList() {
        document.getElementById('filesList').innerHTML = '';
    }

    static updateProgressbar(progress) {
        document.getElementById('progress-bar').style.width = `${progress}%`;
        document.getElementById('progress-bar').setAttribute('aria-valuenow', progress);
    }

    static resetProgressbar() {
        document.getElementById('progress-bar').style.width = `0%`;
        document.getElementById('progress-bar').setAttribute('aria-valuenow', 0);
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
            Firebase.getFiles();
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

document.getElementById('previewCloseBtn').addEventListener('click', e => {
    UI.hideModal();
    UI.resetImg();
});

document.getElementById('deleteConfirmBtn').addEventListener('click', e => {
    Firebase.deleteFile();
    UI.hideModal();
});

document.getElementById('deleteCloseBtn').addEventListener('click', e => {
    UI.hideModal();
});

document.getElementById('fileAddBtn').addEventListener('click', e => {
    Firebase.uploadFile(document.getElementById('inputFile').files[0]);
});