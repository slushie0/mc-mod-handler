const path = require('path');
const fs = require('fs');
const { ipcRenderer } = require('electron');
const { app } = require('@electron/remote');
const axios = require('axios');

ipcRenderer.on('download-success', (event, arg) => {
  console.log(arg)
});

var modList = {};

var modQueue = [];

function loadData() {
  fs.readFile(`./mc-mod-handler.txt`, 'utf8', (err, data) => {
        
    // save the data to the variable
    modList = JSON.parse(data);

    // add the mods to the ui
    refreshModHtml();
  });
};

loadData();

function saveData() {
  try {
  fs.writeFile(`./mc-mod-handler.txt`, JSON.stringify(modList), err => { 
    if (err) {
      warn('Could not save mod list', 'save-warning')
      console.error(err);
    }
  });
  } catch (err) {
    warn('Could not save mod list', 'save-warning')
    console.error(err);
  }
};

function refreshModHtml() {
  var modListEl = document.getElementById('mod-list');
  modListEl.innerHTML = '';
  Object.keys(modList).forEach((key, index) => {
    // dom manipulation
    var slug = key;
    var item = document.createElement('li');
    var enableMod = document.createElement('input');
    var label = document.createElement('label');
    var rmBtn = document.createElement('button');
    rmBtn.innerText = 'remove';
    rmBtn.setAttribute('onclick', `removeMod('${slug}')`);
    rmBtn.type = 'button';
    rmBtn.classList = 'btn btn-danger btn-sm rm-btn';
    enableMod.id = `enableMod-${slug}`;
    enableMod.type = 'checkbox';
    enableMod.value = '';
    enableMod.checked = modList[slug].enabled;
    enableMod.classList = 'form-check-input me-1';
    label.setAttribute('for', `enableMod-${slug}`);
    label.classList = 'form-check-label stretched-link';
    label.innerText = modList[slug].title;
    item.id = slug;
    item.classList = 'mod-item list-group-item';
    item.prepend(enableMod);
    item.appendChild(label);
    item.appendChild(rmBtn);
    modListEl.appendChild(item);
  });
};

function addMod() {
  var slug = document.getElementById('mod-slug').value;
  if (modQueue.indexOf(slug) >= 0 || modList.hasOwnProperty(slug)) return warn('This mod has already been added');
  modQueue.push(slug);
  try {
    axios.get(`https://api.modrinth.com/v2/project/${slug}`).then(res => {
      modQueue.splice(modQueue.indexOf(slug), 1);
      modList[slug] = {
        title: res.data.title,
        enabled: true
      };
      refreshModHtml();
      clearWarns();
    }).catch(err => axiosErr(err, 'slug-warning'));
  } catch (err) { /*return warn('Something went wrong')*/ console.error(err) }
};

function removeMod(slug) {
  delete modList[slug];
  refreshModHtml();
}

function downloadMods() {
  var urls = [];
  var i = 0;
  fs.rm(app.getPath('downloads')+'/MC Mod Folder', { recursive: true, force: true }, err => {
    if(err) {
      warn('Something went wrong', 'download-warning');
      console.error(err.message);
    }
    console.log(document.getElementById('version').value);
    Object.keys(modList).forEach((key, index) => {
      if (document.getElementById(`enableMod-${key}`).checked) {
        let downloadFeatured = document.getElementById('download-featured').checked ? '&featured=true' : '';
        axios.get(`https://api.modrinth.com/v2/project/${key}/version?game_versions=["${document.getElementById('version').value}"]${downloadFeatured}`).then(res => {
          i++;
          if (res.data.length > 0) {
            urls.push(res.data[0].files[0].url);

            if (i == Object.keys(modList).length) ipcRenderer.send('download-item', urls);
          } else {
            console.log(`no downloads for this version: ${key}`);
          }
        }).catch(err => axiosErr(err, 'download-warning'));
      }
    });
  });
};

function warn(msg, el) {
  var warnEl = document.getElementById(el || 'slug-warning');
  warnEl.innerText = msg;
};

function clearWarns() {
  var warns = document.getElementsByClassName('warning');
  for (var i = 0; i < warns.length; i++) {
    warns[i].innerText = '';
  }
}

function axiosErr (error, el) {
  warn('Something went wrong.', el);
  console.log('ERROR');
  console.error(error);
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    console.log('| Bad Response');
    console.log('| '+error.response.data);
    console.log('| '+error.response.status);
    console.log('| '+error.response.headers);
  } else if (error.request) {
    // The request was made but no response was received
    // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
    // http.ClientRequest in node.js
    console.log('| '+'No Response');
    console.log('| '+error.request);
  } else {
    // Something happened in setting up the request that triggered an Error
    console.log('| Bad Request (Error in code)');
    console.log('| Error', error.message);
  }
  console.log('| '+error.config);
}