const { ipcRenderer } = require('electron');
const axios = require('axios');

ipcRenderer.on('download complete', (event, file) => {
  console.log(file); // Full file path
});

var allModUrls = [];

function addMod() {
  let slug = document.getElementById('mod-slug').value;
  let modList = document.getElementById('mod-list');

  $.getJSON(`https://api.modrinth.com/v2/project/${slug}`, res => {
    let item = document.createElement('li');
    item.classList.add('mod-item');
    item.innerText = res.title;
    modList.appendChild(item);

    $.getJSON(`https://api.modrinth.com/v2/project/${slug}/version`, res2 => {
      let url = res2[0].files[0].url;
      allModUrls.push(url);
    });
  });
};

function downloadAllMods() {
  console.log(ipcRenderer)
  ipcRenderer.send("download", {
    url: allModUrls[0],
    properties: {directory: "C:/Users/eric/Downloads"}
  });
};