document.getElementById("start").addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "startAutoBet" });
  });
  
document.getElementById("stop").addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "stopAutoBet" });
});
  

chrome.runtime.sendMessage({ action: "getBetCount" }, function(response) {
  if (response && response.count !== undefined) {
    document.getElementById('betCount').textContent = response.count;
  } else {
    document.getElementById('betCount').textContent = "Error fetching bet count.";
  }
});

chrome.storage.onChanged.addListener(function(changes, area) {
  if (area === "local" && changes.betCount && changes.betCount.newValue !== undefined) {
    document.getElementById('betCount').textContent = changes.betCount.newValue;
  }
});
