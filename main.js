// Modules to control application life and create native browser window
const { app, Menu, BrowserWindow, BrowserView, globalShortcut } = require("electron");

const Store = require('electron-store');
const prompt = require('electron-prompt');

const store = new Store();

let mainWindow;

function createWindow() {

    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 720,
        fullscreen: false,
        webPreferences: {
            nodeIntegration: false
        },
        show: false,
    });

    mainWindow.setIcon('icon.png');
    mainWindow.setMenu(null);
    mainWindow.setTitle('VS Code Web');

    let appUrl = store.get('appUrl');
    console.log('got appUrl', appUrl);

    if (appUrl) {
        mainWindow.loadURL(appUrl);
        mainWindow.show();
    } else {

        prompt({
            title: 'Coder Server URL',
            alwaysOnTop: true,
            label: 'URL:',
            value: 'https://code.tgxn.tech',
            inputAttrs: {
                type: 'url'
            },
            type: 'input'
        }).then(result => {
            if (result === null) {
                console.log('user cancelled');
            } else {
                store.set('appUrl', result);

                mainWindow.loadURL(result);
                mainWindow.show();
            }
        }).catch(console.error);

    }

    mainWindow.on("closed", function () {
        mainWindow = null;
    });

    // http basic auth
    app.on('login', function (event, webContents, request, authInfo, callback) {
        event.preventDefault();

        let usernamePromise, passwordPromise;

        // check for saved user
        let storedUsername = store.get('appUser');
        if (storedUsername) {
            usernamePromise = Promise.resolve(storedUsername);
        } else {
            usernamePromise = prompt({
                title: 'Username',
                label: 'Enter Username',
                alwaysOnTop: true,
                value: '',
                inputAttrs: {
                    type: 'text',
                    required: true
                },
                type: 'input'
            });
        }

        passwordPromise = prompt({
            title: 'Password',
            label: 'Enter Password',
            alwaysOnTop: true,
            value: '',
            inputAttrs: {
                type: 'password',
                required: true
            },
            type: 'input'
        });

        let prompts = [
            usernamePromise,
            passwordPromise
        ];

        Promise.all(prompts).then(results => {

            console.log('got app User', results[0]);

            store.set('appUser', results[0]);

            callback(results[0], results[1]);

        }).catch(console.error);

    });

}

app.on("ready", createWindow);

// Quit when all windows are closed.
app.on("window-all-closed", function () {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
});

app.on(
    "certificate-error",
    (event, webContents, url, error, certificate, callback) => {
        // On certificate error we disable default behaviour (stop loading the page)
        // and we then say "it is all fine - true" to the callback
        event.preventDefault();
        callback(true);
    }
);
