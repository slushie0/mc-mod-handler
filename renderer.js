const path = require('path');
const fs = require('fs');
const { ipcRenderer } = require('electron')
const axios = require('axios');
const { download } = require('electron-dl');

var appDataPath = '';
var downloadsPath = '';
ipcRenderer.on('asynchronous-message', function (evt, message) {
  appDataPath = message.appData;
  downloadsPath = message.downloads;
  loadData();
});

var allModSlugs = [];

function loadData() {
fs.readFile(`${appDataPath}/.minecraft/mc-mod-handler.txt`, 'utf8', (err, data) => {
      
  // Display the file content
  try {
  allModSlugs = JSON.parse(data);
  for (let i in allModSlugs) {
    addListItem(allModSlugs[i]);
  }
} catch (err) { return console.log(err)}
});
};

function saveData() {
  fs.writeFile(`${appDataPath}/.minecraft/mc-mod-handler.txt`, JSON.stringify(allModSlugs), err => { if (err) return console.error(err) });
};

function addListItem(title) {
  let modList = document.getElementById('mod-list');
  let item = document.createElement('li');
  item.classList.add('mod-item');
  item.innerText = title;
  modList.appendChild(item);
};

function addMod() {
  let slug = document.getElementById('mod-slug').value;

  axios.get(`https://api.modrinth.com/v2/project/${slug}`).then(res => {
    addListItem(res.data.title);
    allModSlugs.push(slug);
    saveData();
  });
};

function downloadAllMods() {
  fs.rmSync(downloadsPath+'/MC Mod Folder', { recursive: true, force: true });
  for (let i in allModSlugs) {
    axios.get(`https://api.modrinth.com/v2/project/${allModSlugs[i]}/version`).then(res2 => {
      let url = res2.data[0].files[0].url;
      ipcRenderer.send('download-item', {url})
    });
  }
};

ipcRenderer.on('download-success', (event, arg) => {
  console.log(arg)
});