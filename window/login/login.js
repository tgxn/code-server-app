const {
    ipcRenderer,
    remote
} = require('electron')

const Store = require('electron-store');
const store = new Store();

let userInput = document.getElementById('inputUsername');
let passInput = document.getElementById('inputPassword');

let submitForm = () => {
    let username = userInput.value;
    let password = passInput.value;

    ipcRenderer.send('login_form', username, password);

    var window = remote.getCurrentWindow();
    window.destroy();
};

let appUser = store.get('appUser');
if (appUser) {
    userInput.value = appUser;
    passInput.focus();
}

passInput.addEventListener("keyup", function (event) {
    // Number 13 is the "Enter" key on the keyboard
    if (event.keyCode === 13) {
        event.preventDefault();
        submitForm();
    }
});

document.getElementById('submit').addEventListener('click', () => submitForm());