function fetchAndDisplayHistory() {
    fetch('http://localhost:3000/history')
        .then(response => response.json())
        .then(data => {
            const historyDiv = document.getElementById('history');
            data.forEach(item => {
                const p = document.createElement('p');
                p.textContent = item.url;
                historyDiv.appendChild(p);
            });
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}

// Call the function to fetch and display the history
fetchAndDisplayHistory();