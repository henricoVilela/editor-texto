
const { app, BrowserWindow, Menu, dialog, ipcMain, shell } = require('electron');
const fs = require('fs');
const path = require('path');

//Janela Principal
var mainWindow = null;
async function createWindow () {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600, 
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        }
    });

    await mainWindow.loadFile('src/pages/editor/index.html');

    //mainWindow.webContents.openDevTools();

    createNewFile();

    ipcMain.on('update-content', (event, data) => file.content = data);
}

var file = {};

function createNewFile() {
    const name = 'novo-arquivo.txt';
    file = {
        name: name,
        content: '',
        saved: false,
        path: app.getPath('documents') + '/' + name
    }

    mainWindow.webContents.send('set-file', file);
}

function writeFile(filePath) {
    try {
        fs.writeFile(filePath, file.content, (error) => {
            if (error) throw error;

            file.path = filePath;
            file.saved = true;
            file.name = path.basename(filePath);

            mainWindow.webContents.send('set-file', file);
        })
    } catch (error) {
        console.log(error)
    }
}

async function saveFileAs() {
    const dialogFile = await dialog.showSaveDialog({
        defaultPath: file.path
    });

    if (dialogFile.canceled) 
        return false;
    
    writeFile(dialogFile.filePath);

}

function saveFile() {
    if (file.saved) 
        return writeFile(file.path);
    
    return saveFileAs();
}

function readFile(filePath) {
    try {
        return fs.readFileSync(filePath, 'utf8');
    } catch (error) {
        console.log(error);
        return '';
    }
}

async function openFile() {
    const dialogFile = await dialog.showOpenDialog({
        defaultPath: file.path
    });

    if (dialogFile.canceled) 
        return false;

    file = {
        name: path.basename(dialogFile.filePaths[0]),
        content: readFile(dialogFile.filePaths[0]),
        saved: true,
        path: dialogFile.filePaths[0]
    }

    mainWindow.webContents.send('set-file', file);
}

//Template menu
const templateMenu = [
    {
        label: 'Arquivo',
        submenu: [
            {
                label: 'Novo',
                accelerator: 'CmdOrCtrl+N',
                click() {
                    createNewFile();
                }
            },
            {
                label: 'Abrir',
                accelerator: 'CmdOrCtrl+O',
                click() {
                    openFile();
                }
            },
            {
                label: 'Salvar',
                accelerator: 'CmdOrCtrl+S',
                click() {
                    saveFile();
                }
            },
            {
                label: 'Salvar Como',
                accelerator: 'CmdOrCtrl+Shift+S',
                click() {
                    saveFileAs();
                }
            },
            {
                label: 'Fechar',
                role: process.platform === 'darwin' ? 'close' : 'quit'
            }
        ]
    },
    {
        label: 'Editar',
        submenu: [
            {
                label: 'Desfazer',
                role: 'undo'
            },
            {
                label: 'Refazer',
                role: 'redo'
            },
            {
                type: 'separator'
            },
            {
                label: 'Copiar',
                role: 'copy'
            },
            {
                label: 'Cortar',
                role: 'cut'
            },
            {
                label: 'Colar',
                role: 'paste'
            },
            
        ]
    },
    {
        label: 'Ajuda',
        submenu: [
            {
                label: 'Link Externo',
                click() {
                    shell.openExternal('https://google.com')
                }
            }
        ]
    }
];

//Menu
const menu = Menu.buildFromTemplate(templateMenu);
Menu.setApplicationMenu(menu);

//On ready
app.whenReady().then(createWindow);

//Activate necessário para mac
app.on('activate', () => {
    if(BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});