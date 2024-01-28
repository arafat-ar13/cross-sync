console.log("it's working")

let sessionId = localStorage.getItem('sessionId');
let userId = localStorage.getItem('userId');
console.log(userId);
chrome.history.onVisited.addListener(function(historyItem) {
    console.log('Page not visited: ' + userId)
    fetch('http://localhost:3000/visited', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + sessionId,
        },
        body: JSON.stringify({ url: historyItem.url, userId: userId }),
        credentials: 'include',
      });
});

// ... authenticate user ...
localStorage.setItem('userId', user.id); // set user id in local storage

function fetchHistory() {
    fetch('http://localhost:3000/history', {
        method: 'GET',
        headers: {
            "Authorization": "Bearer " + sessionId,
        },
        credentials: 'include',
    })
      .then(response => response.json())
      .then(data => console.log(data))
      .catch((error) => {
        console.error('Error:', error);
      });
  }
  
// Call the function to fetch the history
fetchHistory();