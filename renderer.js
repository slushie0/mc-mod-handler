const { ipcRenderer } = require('electron')
const axios = require('axios');

var allModUrls = [];

function addMod() {
  let slug = document.getElementById('mod-slug').value;
  let modList = document.getElementById('mod-list');

  axios.get(`https://api.modrinth.com/v2/project/${slug}`).then(res => {
    let item = document.createElement('li');
    item.classList.add('mod-item');
    item.innerText = res.data.title;
    modList.appendChild(item);

    axios.get(`https://api.modrinth.com/v2/project/${slug}/version`).then(res2 => {
      let url = res2.data[0].files[0].url;
      allModUrls.push(url);
    });
  });
};

function downloadAllMods() {
  ipcRenderer.send('download-item', {url: allModUrls[0]})
};

ipcRenderer.on('download-success', (event, arg) => {
  console.log(arg)
});