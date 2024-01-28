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

function fetchHistory() {
    fetch('http://localhost:3000/history')
      .then(response => response.json())
      .then(data => console.log(data))
      .catch((error) => {
        console.error('Error:', error);
      });
  }
  
  // Call the function to fetch the history
  fetchHistory();