chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "startScraping") {
    scrollAndScrapeData(
      request.totalDuration,
      request.scrapeInterval,
      request.scrollSpeed,
      request.numberOfAdsThreshold
    );
  }
});

function scrollAndScrapeData(tDuraction, scrapeI, scrollS, nOfAds) {
  const dataObjects = []; // Array to store the extracted data objects
  const scrapedData = new Set(); // Set to track scraped data

  // Set the duration for scrolling and scraping (10 minutes in milliseconds)
  const totalDuration = tDuraction; // 10 minutes
  const scrapeInterval = scrapeI; // 1 minute
  const scrollSpeed = scrollS; // Adjust the scroll speed as needed
  const numberOfAdsThreshold = nOfAds; // Control the number of Ads you want to extract
  //const callToActionsToCheck = ["Shop now"]; // Add your call to actions here, Each cta you add, will be included in the csv file
  let startTime = Date.now();
  let lastScrapeTime = startTime;

  // Function to extract ads, page name, and page link from each div
  async function extractDataFromDiv(div) {
    const containerText = div.textContent;
    const adsMatch = containerText.match(/(\d+) ads/);
    const pageLinkElement = div.querySelector("a.xt0b8zv.x8t9es0.x1fvot60");
    const libraryIdElement = div.querySelector(
      "span.x8t9es0.xw23nyj.xo1l8bm.x63nzvj.x108nfp6.xq9mrsl.x1h4wwuj.xeuugli"
    );

    if (adsMatch && pageLinkElement) {
      const numberOfAds = parseInt(adsMatch[1]);
      if (numberOfAds >= numberOfAdsThreshold) {
        const pageName = pageLinkElement.innerText;
        const pageURL = pageLinkElement.href;
        const libraryIdText = libraryIdElement.textContent;
        const libraryIdMatch = libraryIdText.match(/Library ID: (\d+)/);
        const libraryId = libraryIdMatch[1];
        const libraryLink = `https://web.facebook.com/ads/library/?id=${libraryId}`;

        // Check if the data is not already scraped
        const dataKey = `${numberOfAds}-${pageName}-${pageURL}-${libraryLink}`;
        if (!scrapedData.has(dataKey)) {
          scrapedData.add(dataKey);
          const dataObject = {
            pageName,
            numberOfAds,
            pageURL,
            libraryLink,
          };
          dataObjects.push(dataObject);
        }
      }
    }
  }

  // Function to convert data to CSV format
  function convertToCSV(dataObjects) {
    const csvData = dataObjects.map((obj) => {
      return `${obj.pageName},${obj.numberOfAds},${obj.pageURL},${obj.libraryLink}`;
    });
    return `Page Name,Number of Ads,Page Link,Ad Link\n${csvData.join("\n")}`;
  }

  // Function to save the data to a CSV file
  function saveDataToCSV() {
    const csvData = convertToCSV(dataObjects);
    const blob = new Blob([csvData], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "extracted_info.csv";
    a.click();
  }

  // Function to scroll and scrape data
  function scrollAndScrapeStep() {
    // Scroll the page
    window.scrollBy(0, scrollSpeed); // Adjust scroll speed here

    // Check if it's time to scrape data
    const currentTime = Date.now();
    if (currentTime - lastScrapeTime >= scrapeInterval) {
      // Select the divs with class "_7jvw"
      const containerDivs = document.querySelectorAll("div._7jvw");

      // Loop through the divs and extract data from each
      containerDivs.forEach((div) => {
        extractDataFromDiv(div);
      });

      lastScrapeTime = currentTime;

      // Check if the total duration has elapsed
      if (currentTime - startTime >= totalDuration) {
        clearInterval(scrollAndScrapeInterval);
        saveDataToCSV();
      }
    }
  }

  // Start scrolling and scraping at regular intervals
  const scrollAndScrapeInterval = setInterval(scrollAndScrapeStep, 20); // Adjust the interval as needed
}

// Call the scrollAndScrapeData function to begin scrolling and scraping data
scrollAndScrapeData();
