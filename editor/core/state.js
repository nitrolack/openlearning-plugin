// editor/core/state.js

window.State = (function () {

    let data = {
      world: "",
      metas: []
    };
  
    function load(callback) {
      chrome.storage.local.get(["openLearningMeta"], res => {
        if (res.openLearningMeta) {
          data = res.openLearningMeta;
        }
        callback();
      });
    }
  
    function save() {
      chrome.storage.local.set({ openLearningMeta: data });
    }
  
    function get() {
      return data;
    }
  
    function set(newData) {
      data = newData;
      save();
    }
  
    return { load, save, get, set };
  
  })();