chrome.runtime.onInstalled.addListener(() => initProxyState());
chrome.runtime.onStartup.addListener(() => restoreProxyState());
chrome.action.onClicked.addListener(() => toggleProxy());

function setProxyEnabled(enabled) {
    chrome.storage.local.set({ proxyEnabled: enabled });
    if (enabled) {
        const proxy = "PROXY chromium.api.cdn-perfprod.com:2023; DIRECT";
        const pacScript = `
        function FindProxyForURL(url, host) {
          if (/^usher\\.ttvnw\\.net$/i.test(host)) return \"${proxy}\";
          return \"DIRECT\";
        }
      `;
        chrome.proxy.settings.set({
            value: { mode: "pac_script", pacScript: { data: pacScript } },
            scope: "regular"
        });
        chrome.action.setBadgeText({ text: "ON" });
        chrome.action.setBadgeBackgroundColor({ color: "#4caf50" });
    } else {
        chrome.proxy.settings.clear({ scope: "regular" });
        chrome.action.setBadgeText({ text: "OFF" });
        chrome.action.setBadgeBackgroundColor({ color: "#f44336" });
    }
}

function toggleProxy() {
    chrome.storage.local.get(["proxyEnabled"], (result) => {
        setProxyEnabled(!result.proxyEnabled);
    });
}

function initProxyState() {
    chrome.storage.local.get(["proxyEnabled"], (result) => {
        if (typeof result.proxyEnabled === "undefined") {
            setProxyEnabled(true); // Включено по умолчанию
        } else {
            setProxyEnabled(result.proxyEnabled);
        }
    });
}

function restoreProxyState() {
    chrome.storage.local.get(["proxyEnabled"], (result) => {
        setProxyEnabled(!!result.proxyEnabled);
    });
}