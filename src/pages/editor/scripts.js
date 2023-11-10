const { ipcRenderer } = require('electron');

//Elementos
const textarea = document.getElementById('text');
const title = document.getElementById('title');


ipcRenderer.on('set-file', (event, data) => {
    textarea.value = data.content;
    title.innerHTML = data.name;
});

//Update texto
function handleChangeText() {
    ipcRenderer.send('update-content', textarea.value);
}