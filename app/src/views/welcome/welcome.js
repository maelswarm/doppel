document.querySelector('#signupButton').addEventListener('click', (e) => {
    const email = document.querySelector('#emailField').value
    const password = document.querySelector('#passwordField').value;
    const messageElem = document.querySelector('#messageField');

    fetch('/signup', {
        method: 'POST', body: JSON.stringify({ email, password }), headers: {
            'Content-Type': 'application/json'
        }
    }).then(response => response.json()).then((result) => {
        if(result.msg === 'Success') {
            document.querySelector('#passwordField').value = '';
            messageElem.innerHTML = 'Registration Success :) please log in!';
        } else if (result.msg === 'Failure') {
            messageElem.innerHTML = 'Registration failed :(';
        }
    });
});

document.querySelector('#loginButton').addEventListener('click', (e) => {
    const email = document.querySelector('#emailField').value
    const password = document.querySelector('#passwordField').value;
    const messageElem = document.querySelector('#messageField');

    fetch('/login', {
        method: 'POST', body: JSON.stringify({ email, password }), headers: {
            'Content-Type': 'application/json'
        }
    }).then(response => response.json()).then((result) => {
        if(result.msg === 'Success') {
            window.location.href = '/app';
        } else if (result.msg === 'Failure') {
            messageElem.innerHTML = 'Login failed :(';
        }
     });
});