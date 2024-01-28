console.log("it's working")

chrome.history.onVisited.addListener(function(historyItem) {
    console.log('Page visited: ' + historyItem.url);
    
    fetch('http://localhost:3000/visited', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: historyItem.url }),
      });
});