/*
    Camada de Servico para comunicacao com a API (Backend).
    Centraliza URL base, headers de autenticacao, tratamento de 401 e parsing das respostas.
    Todas as chamadas de rede do frontend devem passar por aqui - os outros JS lidam apenas
    com DOM, eventos, validacao e renderizacao.
*/

// URL base da API com deteccao automatica de ambiente.
// localhost/127.0.0.1 -> backend local (Docker Compose ou Maven em :8080).
// Demais hosts (Netlify) -> API de producao no Render.
const API_BASE_URL = ['localhost', '127.0.0.1'].includes(window.location.hostname)
    ? 'http://localhost:8080'
    : 'https://bloodcrown-api.onrender.com';

/**
 * Wrapper interno para chamadas autenticadas.
 * Injeta o header Authorization, trata 401 (limpa token + redireciona para login)
 * e devolve o Response para o caller tratar status restantes.
 * Lanca Error em 401 para o caller poder abortar via try/catch.
 * @param {string} path - Caminho da API (ex: "/characters/123"), sem o host.
 * @param {Object} options - Opcoes do fetch (method, headers extras, body).
 * @param {string} token - Token JWT.
 * @returns {Promise<Response>}
 */
async function authorizedFetch(path, options, token) {
    const opts = options || {};
    const headers = Object.assign({}, opts.headers || {}, {
        'Authorization': `Bearer ${token}`
    });
    const response = await fetch(`${API_BASE_URL}${path}`, Object.assign({}, opts, { headers }));

    if (response.status === 401) {
        localStorage.removeItem('authToken');
        const currentPath = window.location.pathname;
        if (!currentPath.endsWith('index.html') && !currentPath.endsWith('/')) {
            window.location.href = 'index.html';
        }
        throw new Error('Sessao expirada');
    }

    return response;
}

// ============================================================
// AUTH (endpoints publicos)
// ============================================================

/**
 * Registra um novo usuario.
 * @param {string} username
 * @param {string} password
 * @returns {Promise<Object>} Dados do usuario criado.
 */
async function registerUser(username, password) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    if (!response.ok) {
        throw new Error('Falha no cadastro. Verifique os dados ou tente mais tarde.');
    }

    return await response.json();
}

/**
 * Autentica o usuario e devolve o token JWT.
 * @param {string} username
 * @param {string} password
 * @returns {Promise<string>} Token JWT.
 */
async function loginUser(username, password) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    if (!response.ok) {
        throw new Error('Falha no login. Verifique nome de usuario ou senha.');
    }

    const data = await response.json();
    return data.token;
}

// ============================================================
// CHARACTERS
// ============================================================

/**
 * Lista todos os personagens do usuario logado.
 * @param {string} token
 * @returns {Promise<Array>}
 */
async function apiListCharacters(token) {
    const response = await authorizedFetch('/characters', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    }, token);

    if (!response.ok) throw new Error('Falha ao buscar fichas');
    return await response.json();
}

/**
 * Busca os dados detalhados de uma ficha.
 * @param {string} id
 * @param {string} token
 * @returns {Promise<Object>}
 */
async function getCharacterById(id, token) {
    const response = await authorizedFetch(`/characters/${id}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    }, token);

    if (!response.ok) {
        if (response.status === 403) throw new Error('Voce nao tem permissao para ver essa ficha.');
        if (response.status === 404) throw new Error('Ficha nao encontrada');
        throw new Error('Erro ao carregar dados da ficha.');
    }

    return await response.json();
}

/**
 * Cria uma ficha em branco para o usuario.
 * @param {string} token
 * @returns {Promise<Object>} Personagem recem-criado.
 */
async function apiCreateCharacter(token) {
    const response = await authorizedFetch('/characters', {
        method: 'POST'
    }, token);

    if (!response.ok) throw new Error('Erro ao criar ficha');
    return await response.json();
}

/**
 * Atualiza uma ficha existente.
 * @param {string} charId
 * @param {Object} updatedData - Payload completo do personagem.
 * @param {string} token
 * @returns {Promise<Object>} Ficha apos persistencia.
 */
async function apiUpdateCharacter(charId, updatedData, token) {
    const response = await authorizedFetch(`/characters/${charId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
    }, token);

    if (!response.ok) throw new Error('Erro ao salvar ficha.');
    return await response.json();
}

/**
 * Exclui uma ficha.
 * @param {string} charId
 * @param {string} token
 */
async function apiDeleteCharacter(charId, token) {
    const response = await authorizedFetch(`/characters/${charId}`, {
        method: 'DELETE'
    }, token);

    if (!response.ok) throw new Error('Erro ao deletar');
}

/**
 * Aciona o descanso longo (restaura recursos e usos).
 * @param {string} charId
 * @param {string} token
 */
async function apiRestCharacter(charId, token) {
    const response = await authorizedFetch(`/characters/${charId}/rest`, {
        method: 'POST'
    }, token);

    if (!response.ok) throw new Error('Erro ao realizar descanso.');
}

// ============================================================
// ATTACKS
// ============================================================

/**
 * Cria um novo ataque para o personagem.
 * @param {string} characterId
 * @param {Object} attackData
 * @param {string} token
 * @returns {Promise<Object>} Ataque criado.
 */
async function apiCreateAttack(characterId, attackData, token) {
    const response = await authorizedFetch(`/attacks/${characterId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(attackData)
    }, token);

    if (!response.ok) throw new Error('Erro ao criar ataque');
    return await response.json();
}

/**
 * Remove um ataque.
 * @param {string} attackId
 * @param {string} token
 */
async function apiDeleteAttack(attackId, token) {
    const response = await authorizedFetch(`/attacks/${attackId}`, {
        method: 'DELETE'
    }, token);

    if (!response.ok) throw new Error('Erro ao deletar');
}

// ============================================================
// ABILITIES
// ============================================================

/**
 * Cria uma nova habilidade.
 * @param {string} characterId
 * @param {Object} abilityData
 * @param {string} token
 * @returns {Promise<Object>} Habilidade criada.
 */
async function apiCreateAbility(characterId, abilityData, token) {
    const response = await authorizedFetch(`/abilities/${characterId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(abilityData)
    }, token);

    if (!response.ok) throw new Error('Erro ao criar habilidade');
    return await response.json();
}

/**
 * Remove uma habilidade.
 * @param {string} abilityId
 * @param {string} token
 */
async function apiDeleteAbility(abilityId, token) {
    const response = await authorizedFetch(`/abilities/${abilityId}`, {
        method: 'DELETE'
    }, token);

    if (!response.ok) throw new Error('Erro ao deletar');
}

/**
 * Alterna ativacao da habilidade.
 * Propaga a mensagem retornada pelo backend em caso de erro (ex: recurso insuficiente).
 * @param {string} abilityId
 * @param {string} token
 */
async function apiToggleAbility(abilityId, token) {
    const response = await authorizedFetch(`/abilities/${abilityId}/toggle`, {
        method: 'POST'
    }, token);

    if (!response.ok) {
        const errorMsg = await response.text();
        throw new Error(errorMsg || 'Erro ao ativar habilidade');
    }
}

/**
 * Recupera um uso da habilidade consumindo o recurso indicado.
 * Propaga a mensagem retornada pelo backend em caso de erro.
 * @param {string} abilityId
 * @param {string} resource - "MANA" ou "STAMINA".
 * @param {string} token
 */
async function apiRecoverAbility(abilityId, resource, token) {
    const response = await authorizedFetch(`/abilities/${abilityId}/recover?resource=${resource}`, {
        method: 'POST'
    }, token);

    if (!response.ok) {
        const msg = await response.text();
        throw new Error(msg || 'Erro ao recuperar uso.');
    }
}

/**
 * Avanca o turno do personagem (reduz cooldowns).
 * @param {string} characterId
 * @param {string} token
 */
async function apiAdvanceTurn(characterId, token) {
    const response = await authorizedFetch(`/abilities/next-turn/${characterId}`, {
        method: 'POST'
    }, token);

    if (!response.ok) throw new Error('Erro ao passar turno.');
}

// ============================================================
// ITEMS
// ============================================================

/**
 * Cria um item no inventario do personagem.
 * @param {string} characterId
 * @param {Object} itemData
 * @param {string} token
 * @returns {Promise<Object>} Item criado.
 */
async function apiCreateItem(characterId, itemData, token) {
    const response = await authorizedFetch(`/items/${characterId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData)
    }, token);

    if (!response.ok) throw new Error('Erro ao criar item');
    return await response.json();
}

/**
 * Alterna o estado de equipado/desequipado do item.
 * @param {string} itemId
 * @param {string} token
 */
async function apiToggleItem(itemId, token) {
    const response = await authorizedFetch(`/items/${itemId}/toggle`, {
        method: 'POST'
    }, token);

    if (!response.ok) throw new Error('Erro ao alternar equipamento');
}

/**
 * Remove um item do inventario.
 * @param {string} itemId
 * @param {string} token
 */
async function apiDeleteItem(itemId, token) {
    const response = await authorizedFetch(`/items/${itemId}`, {
        method: 'DELETE'
    }, token);

    if (!response.ok) throw new Error('Erro ao deletar item');
}
