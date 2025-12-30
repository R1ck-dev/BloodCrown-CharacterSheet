const API_BASE_URL = 'https://bloodcrown-api.onrender.com'

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

async function getCharacterById(id, token) {
    const response = await fetch(`${API_BASE_URL}/characters/${id}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        if (response.status === 403) throw new Error('Você não tem permissão para ver essa ficha.');
        if (response.status === 404) throw new Error('Ficha não encontrada');
        throw new Error('Erro ao carregar dados da ficha.');
    }

    return await response.json();
}