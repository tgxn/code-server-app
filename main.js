const {
    app,
    ipcMain,
    Menu,
    BrowserWindow,
    Tray
} = require("electron");

const Store = require('electron-store');
const prompt = require('electron-prompt');

const store = new Store();

let mainWindow, tray;

let setupBasicAuth = () => {
    return new Promise((resolve, reject) => {

        let loginWindow = new BrowserWindow({
            width: 400,
            height: 250,
            backgroundColor: "#252526",
            autoHideMenuBar: true,
            frame: false,
            resizable: false,
            movable: false,
            modal: true,
            center: true,
            parent: mainWindow,

            webPreferences: {
                nodeIntegration: true,
            },
            show: false,
        });

        loginWindow.loadURL(`file://${__dirname}/window/login/login.html`);

        loginWindow.once('ready-to-show', () => {
            loginWindow.show()
        });

        ipcMain.on('login_form', (event, user, pass) => {

            resolve({
                username: user,
                password: pass
            });

        });

    });
};

let setupHost = () => {

    prompt({
        title: 'Coder Server URL',
        alwaysOnTop: true,
        label: 'URL:',
        value: '',
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
            mainWindow.reload();

        }
    }).catch(console.error);

};

function createWindow() {

    mainWindow = new BrowserWindow({
        width: 1280,
        height: 720,
        show: false,
        icon: 'image/icon.png',
        title: 'Code-Server Client',
        backgroundColor: "#252526",
        autoHideMenuBar: true,
        darkTheme: true,
        webPreferences: {
            nodeIntegration: false,
        },
    });

    tray = new Tray('image/icon.png')
    const contextMenu = Menu.buildFromTemplate([{
            label: "Change Server",
            click: function () {
                setupHost();
            }
        },
        {
            type: "separator"
        },
        {
            label: 'Reload',
            click: function () {
                mainWindow.reload();
            }
        },
        {
            label: "About Application",
            selector: "orderFrontStandardAboutPanel:"
        },
        {
            label: 'Quit',
            click: function () {
                app.quit();
            }
        }
    ])
    tray.setToolTip('Code-Server Client');
    tray.setContextMenu(contextMenu);

    // attempt to load stored url
    let appUrl = store.get('appUrl');

    if (appUrl) {
        mainWindow.loadURL(appUrl);
        mainWindow.show();
    } else {
        setupHost();
    }

    mainWindow.on("closed", function () {
        mainWindow = null;
    });

    // http basic auth
    app.on('login', function (event, webContents, request, authInfo, callback) {
        event.preventDefault();

        setupBasicAuth().then(result => {
            callback(result.username, result.password);
        });

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