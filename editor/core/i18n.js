window.I18N = (function () {

    let currentLang = "de";
  
    const translations = {
      de: {
        title: "OpenLearning Editor",
        metas: "Metas",
        converter: "Converter",
        help: "Hilfe",
  
        addMeta: "Neue Meta",
        tag: "Tag",
        text: "Text",
        image: "Bild URL",
        delete: "Löschen",
  
        loadFile: "Datei laden",
        saveFile: "Datei speichern",
        worldName: "Weltname",
  
        converterTitle: "MapMaking → OpenGuessr",
        pasteMapMaking: "Map-Making JSON hier einfügen",
        convert: "Konvertieren",
        downloadGuessr: "OpenGuessr JSON herunterladen",
        downloadTagHints: "Tag-Hints herunterladen",
        includeTags: "Tags aus Map-Making übernehmen (Hints)",
        invalidMapMaking: "Ungültiges Map-Making JSON",
  
        explanation: "So funktioniert OpenLearning",
        clearAll: "Alle löschen",
        confirmClearAll: "Wirklich alle Metas löschen? Diese Aktion kann nicht rückgängig gemacht werden."
      },
  
      en: {
        title: "OpenLearning Editor",
        metas: "Metas",
        converter: "Converter",
        help: "Help",
  
        addMeta: "Add Meta",
        tag: "Tag",
        text: "Text",
        image: "Image URL",
        delete: "Delete",
  
        loadFile: "Load File",
        saveFile: "Save File",
        worldName: "World Name",
  
        converterTitle: "MapMaking → OpenGuessr",
        pasteMapMaking: "Paste Map-Making JSON here",
        convert: "Convert",
        downloadGuessr: "Download OpenGuessr JSON",
        downloadTagHints: "Download Tag-Hints",
        includeTags: "Include Tags from Map-Making",
        invalidMapMaking: "Invalid Map-Making JSON",
  
        explanation: "How OpenLearning works",
        clearAll: "Clear All",
        confirmClearAll: "Delete all metas? This action cannot be undone."  
      }
    };
  
    function t(key) {
      return translations[currentLang][key] || key;
    }
  
    function setLang(lang) {
      currentLang = lang;
    }
  
    function getLang() {
      return currentLang;
    }
  
    return { t, setLang, getLang };
  
  })();