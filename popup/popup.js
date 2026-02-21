const API = typeof browser !== "undefined" ? browser : chrome;

document.getElementById("openEditor").onclick = () => {
    API.tabs.create({
      url: API.runtime.getURL("editor/editor.html")
    });
  };
  
  document.getElementById("openMapMaking").onclick = () => {
    API.tabs.create({
      url: "https://map-making.app"
    });
  };
  
  document.getElementById("openGithub").onclick = () => {
    API.tabs.create({
      url: "https://github.com/nitrolack/openlearning-plugin"
    });
  };