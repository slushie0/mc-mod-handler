const path = require('path');
const fs = require('fs');
const { ipcRenderer } = require('electron')
const axios = require('axios');

var allModUrls = [];

fs.readFile('C:/Users/ericr/AppData/Roaming/.minecraft/mc-mod-handler.txt', 'utf8', (err, data) => {
      
  // Display the file content
  allModUrls = JSON.parse(data);
  for (let i in allModUrls) {
    addListItem(allModUrls[i]);
  }
});

function saveData() {
  fs.writeFile('C:/Users/ericr/AppData/Roaming/.minecraft/mc-mod-handler.txt', JSON.stringify(allModUrls), err => { if (err) return console.error(err) });
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

    axios.get(`https://api.modrinth.com/v2/project/${slug}/version`).then(res2 => {
      let url = res2.data[0].files[0].url;
      allModUrls.push(url);
      saveData();
    });
  });
};

function downloadAllMods() {
  ipcRenderer.send('download-item', {url: allModUrls[0]})
};

ipcRenderer.on('download-success', (event, arg) => {
  console.log(arg)
});