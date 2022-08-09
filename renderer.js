const path = require('path');
const fs = require('fs');
const { ipcRenderer, app } = require('electron')
const axios = require('axios');

ipcRenderer.on('download-success', (event, arg) => {
  console.log(arg)
});

var modList = {
  /*
  'mod-slug': {
    enabled: true,
  }
  */
};

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
  fs.writeFile(`./mc-mod-handler.txt`, JSON.stringify(modLists), err => { 
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
    var rmBtn = document.createElement('button');
    var enableMod = document.createElement('input');
    rmBtn.innerText = 'remove';
    //rmBtn.setAttribute('onclick', removeMod(slug));
    enableMod.type = 'checkbox';
    enableMod.checked = modList[slug].enabled;
    //enableMod.addEventListener('click', toggleEnabled(slug));
    item.id = slug;
    item.classList.add('mod-item');
    item.innerText = modList[slug].title;
    item.prepend(enableMod);
    item.appendChild(rmBtn);
    modListEl.appendChild(item);
  });
};

function toggleEnabled (slug) {
  modList[slug].enabled = modList[slug].enabled ? modList[slug].enabled = false : modList[slug].enabled = true;
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
    }).catch(function(err) {
      return axiosErr(err);
    })
  } catch (err) { /*return warn('Something went wrong')*/ console.error(err) }
};

function removeMod(slug) {
  delete modList[slug];
  refreshModHtml();
}

function downloadMods() {
  var urls = [];
  fs.rm('./MC Mod Folder', { recursive: true, force: true }, err => {
    if(err) return console.error(err.message);
    
    Object.keys(modList).forEach((key, index) => {
      axios.get(`https://api.modrinth.com/v2/project/${key}/version`).then(res => {
        urls.push(res.data[0].files[0].url);
        
        if (urls.length == Object.keys(modList).length) ipcRenderer.send('download-item', {urls});
      });
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

function axiosErr (error) {
  warn('Something went wrong.', 'slug-warning');
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