document.addEventListener("DOMContentLoaded", function () {
  document
    .getElementById("startScraping")
    .addEventListener("click", function () {
      const totalDuration = parseInt(
        document.getElementById("totalDuration").value
      );
      const scrapeInterval = parseInt(
        document.getElementById("scrapeInterval").value
      );
      const scrollSpeed = parseInt(
        document.getElementById("scrollSpeed").value
      );
      const numberOfAdsThreshold = parseInt(
        document.getElementById("numberOfAdsThreshold").value
      );

      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: "startScraping",
          totalDuration,
          scrapeInterval,
          scrollSpeed,
          numberOfAdsThreshold,
        });
      });
    });
});
