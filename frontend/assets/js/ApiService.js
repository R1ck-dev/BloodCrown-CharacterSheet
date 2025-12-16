const API_BASE_URL = 'http://localhost:8080'

async function registerUser(username, password) {
    const userData = {
        username: username,
        password: password
    };

    const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
    });

    if (!response.ok) {
        throw new Error('Falha no cadastro. Verifique os dados ou tente mais tarde.');
    }

    const registeredUser = await response.json();

    return registeredUser;
}

async function loginUser(username, password) {
    const userData = {
        username: username,
        password: password
    };

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
    });

    if (!response.ok) {
        throw new Error('Falha no login. Verifique nome de usuário ou senha.')
    }

    const data = await response.json();

    return data.token;
}
