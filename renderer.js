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

var modList = [];

/*
function loadData() {
fs.readFile(`${appDataPath}/.minecraft/mc-mod-handler.txt`, 'utf8', (err, data) => {
      
  // Display the file content
  try {
  modList = JSON.parse(data);
  Object.keys(modList).forEach((key, index) => {
    addMod(key);
  });
  } catch (err) { return console.log(err)}
});
};

function saveData() {
  fs.writeFile(`${appDataPath}/.minecraft/mc-mod-handler.txt`, JSON.stringify(modList), err => { if (err) return console.error(err) });
};

*/
function addMod(slug) {
  slug = slug || document.getElementById('mod-slug').value;
  if (modList.hasOwnProperty(slug)) return warn('This mod has already been added');
  modList[slug] = {
    title: 'Unknown'
  };

  try {
    axios.get(`https://api.modrinth.com/v2/project/${slug}`).then(res => {
      // dom manipulation
      let modListEl = document.getElementById('mod-list');
      let item = document.createElement('li');
      let rmBtn = document.createElement('button');
      let disableMod = document.createElement('input');
      rmBtn.innerText = 'remove';
      rmBtn.setAttribute('onclick', `removeMod('${slug}')`)
      disableMod.type = 'checkbox';
      disableMod.checked = true;
      item.id = slug;
      item.classList.add('mod-item');
      item.innerText = res.data.title;
      item.prepend(disableMod);
      item.appendChild(rmBtn);
      modListEl.appendChild(item);
      
      modList[slug] = {
        title: res.data.title
      };
      saveData();
    }).catch(function(err) { 
      if (err.response.status == 404) return warn('Invalid Slug')
      return warn('Something went wrong')
    })
  } catch (err) { return warn('Something went wrong') }
};

function removeMod(slug) {
  delete modList[slug];
  let item = document.getElementById('sodium');
  item.remove();
}

function downloadMods() {
  fs.rmSync(downloadsPath+'/MC Mod Folder', { recursive: true, force: true });
  for (let i in allModSlugs) {
    axios.get(`https://api.modrinth.com/v2/project/${allModSlugs[i]}/version`).then(res2 => {
      let url = res2.data[0].files[0].url;
      ipcRenderer.send('download-item', {url})
    });
  }
};

function warn(msg) {
  var warnEl = document.getElementById('warning');
  warnEl.innerText = msg;
}

ipcRenderer.on('download-success', (event, arg) => {
  console.log(arg)
});