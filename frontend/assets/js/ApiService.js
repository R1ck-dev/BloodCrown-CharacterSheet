/*
    Camada de Serviço para comunicação com a API (Backend).
    Centraliza as URLs e métodos de fetch para reutilização em diferentes partes do sistema.
*/

// Define a URL base da API hospedada no Render
const API_BASE_URL = 'https://bloodcrown-api.onrender.com'

/**
 * Realiza o registro de um novo usuário.
 * @param {string} username - Nome de usuário.
 * @param {string} password - Senha escolhida.
 * @returns {Promise<Object>} Dados do usuário registrado.
 */
async function registerUser(username, password) {
    // Monta o objeto de dados para envio
    const userData = {
        username: username,
        password: password
    };

    // Executa a chamada para o endpoint de registro
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
    });

    // Lança erro caso a resposta não seja satisfatória
    if (!response.ok) {
        throw new Error('Falha no cadastro. Verifique os dados ou tente mais tarde.');
    }

    // Retorna a resposta convertida em JSON
    const registeredUser = await response.json();

    return registeredUser;
}

/**
 * Realiza o login do usuário e recupera o token JWT.
 * @param {string} username - Nome de usuário.
 * @param {string} password - Senha.
 * @returns {Promise<string>} Token de autenticação (JWT).
 */
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

    // Retorna apenas o token contido na resposta
    return data.token;
}

/**
 * Busca os dados detalhados de uma ficha de personagem específica.
 * @param {string} id - ID do personagem.
 * @param {string} token - Token JWT para autorização.
 * @returns {Promise<Object>} Objeto contendo os dados completos da ficha.
 */
async function getCharacterById(id, token) {
    const response = await fetch(`${API_BASE_URL}/characters/${id}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`, // Inclui o token no cabeçalho
            'Content-Type': 'application/json'
        }
    });

    // Trata erros específicos de permissão (403) ou não encontrado (404)
    if (!response.ok) {
        if (response.status === 403) throw new Error('Você não tem permissão para ver essa ficha.');
        if (response.status === 404) throw new Error('Ficha não encontrada');
        throw new Error('Erro ao carregar dados da ficha.');
    }

    return await response.json();
}