function fetchAndDisplayHistory() {
    const sessionId = localStorage.getItem('sessionId');
    console.log("HELLO FETCHING HISTORY")
    fetch('http://localhost:3000/history', {
        headers: {
            "Authorization": "Bearer " + sessionId,
        },
        credentials: 'include',
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        const historyDiv = document.getElementById('history');
        historyDiv.innerHTML = '';
        data.forEach(item => {
            const p = document.createElement('p');
            p.textContent = item.url;
            p.className = 'list-group-item list-group-item-action'; // Add Bootstrap classes
            historyDiv.appendChild(p);
        });

        // Hide the login and signup forms
        document.getElementById('login-form-div').style.display = 'none';
        document.getElementById('signup-form-div').style.display = 'none';

    })
    .catch((error) => {
        console.error('Error:', error);

        // Show the login form
        document.getElementById('login-form-div').style.display = 'block';
        document.getElementById('signup-form-div').style.display = 'block';

    });
}

// Call the function to fetch and display the history
document.addEventListener('DOMContentLoaded', fetchAndDisplayHistory);

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

        //  // Hide the login and forms
        //  document.getElementById('login-form-div').style.display = 'none';
        //  document.getElementById('signup-form-div').style.display = 'none';

         // Show the browsing history
         fetchAndDisplayHistory();
        document.getElementById('history').style.display = 'block';
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


function handleLogout() {
    const sessionId = localStorage.getItem('sessionId');
    fetch('http://localhost:3000/logout', {
        method: 'POST',
        headers: {
            "Authorization": "Bearer " + sessionId,
        },
        credentials: 'include',
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        localStorage.removeItem('sessionId');

        console.log("logged out");

        // Show the login form
        document.getElementById('login-form-div').style.display = 'block';
        document.getElementById('signup-form-div').style.display = 'block';

        // Hide the history
        document.getElementById('history').style.display = 'none';
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('login-form').addEventListener('submit', handleLoginFormSubmission);
    document.getElementById('signup-form').addEventListener('submit', handleRegisterFormSubmission);
    document.getElementById('logout-button').addEventListener('click', handleLogout);
});