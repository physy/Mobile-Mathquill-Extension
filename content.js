(function () {
  "use strict";

  console.log("Desmos mobile mathquill assistant content script loaded");

  // ページコンテキストで実行するスクリプトを注入
  function injectPageScript() {
    const script = document.createElement("script");
    script.src = chrome.runtime.getURL("injected-script.js");
    script.onload = function () {
      this.remove();
    };
    (document.head || document.documentElement).appendChild(script);
  }

  // DOM読み込み後にスクリプトを注入
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", injectPageScript);
  } else {
    injectPageScript();
  }
})();
