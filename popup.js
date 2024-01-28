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

function handleLoginFormSubmission(event) {
    event.preventDefault();

    let username = document.getElementById('login-username').value;
    let password = document.getElementById('login-password').value;

    fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include',
    })
    .then(response => response.json())
    .then(data => {
        localStorage.setItem('sessionId', data.sessionId);
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

function handleRegisterFormSubmission(event) {
    event.preventDefault();

    let username = document.getElementById('signup-username').value;
    let password = document.getElementById('signup-password').value;

    fetch('http://localhost:3000/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include',
    })
    .then(response => response.json())
    .then(data => {
        localStorage.setItem('sessionId', data.sessionId);
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('login-form').addEventListener('submit', handleLoginFormSubmission);
    document.getElementById('signup-form').addEventListener('submit', handleRegisterFormSubmission);
});
