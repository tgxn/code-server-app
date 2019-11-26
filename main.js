// Modules to control application life and create native browser window
const { app, Menu, BrowserWindow, BrowserView, globalShortcut } = require("electron");

const Store = require('electron-store');
const store = new Store();

const prompt = require('electron-prompt');

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
  });

  mainWindow.setMenu(null)

  globalShortcut.register('f5', function () {
    mainWindow.reload()
  })
  globalShortcut.register('CommandOrControl+R', function () {
    mainWindow.reload()
  })

  let appUrl = store.get('appUrl');
  console.log('got appUrl', appUrl);

  if (appUrl) {
    mainWindow.loadURL(appUrl);
  } else {

    prompt({
      title: 'Coder Server URL',
      label: 'URL:',
      value: 'https://code.tgxn.tech/',
      inputAttrs: {
        type: 'url'
      },
      type: 'input'
    }).then(result => {
      if (result === null) {
        console.log('user cancelled');
      } else {
        console.log('result', result);

        store.set('appUrl', result);
        // appUrl = result;

        mainWindow.loadURL(appUrl);
        mainWindow.reload()

      }
    }).catch(console.error);

  }

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on("closed", function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    // Electron.session.defaultSession.clearCache(() => { })
    mainWindow = null;
  });


  app.on('login', function (event, webContents, request, authInfo, callback) {
    event.preventDefault();

    let prompts = [
      prompt({
        title: 'Password',
        label: 'Password:',
        value: '',
        inputAttrs: {
          type: 'password'
        },
        type: 'input'
      })
    ];

    let user = store.get('appUser1');

    if (!user) {
      prompts.push(prompt({
        title: 'Username',
        label: 'Username:',
        value: '',
        inputAttrs: {
          type: 'text'
        },
        type: 'input'
      }));
    } else {
      prompts.push(Promise.resolve(user));
    }

    Promise.all(prompts).then(results => {

      store.set('appUser1', results[1]);

      console.log(results[1], results[0]);

      callback(results[1], results[0]);

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
