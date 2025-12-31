/*
    Controlador do Dashboard (Mesa de Jogo).
    Gerencia a autenticação da sessão, a listagem de personagens e as ações de 
    criar ou excluir fichas.
*/

// Inicializa a lógica assim que o DOM estiver pronto
document.addEventListener('DOMContentLoaded', async function() {
    // Recupera o token de autenticação armazenado
    const token = localStorage.getItem('authToken');

    // Se não houver token, redireciona para a tela de login
    if (!token) {
        window.location.href = 'index.html';
        return;
    }
    
    // Configura o botão de Logout
    const btnLogout = document.getElementById('btnLogout');
    if(btnLogout) {
        btnLogout.addEventListener('click', function() {
            // Exibe confirmação antes de sair
            Swal.fire({
                title: 'Sair?',
                text: "Você será desconectado.",
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Sair',
                cancelButtonText: 'Ficar',
                background: '#212529', color: '#fff'
            }).then((result) => {
                if (result.isConfirmed) {
                    // Remove o token e redireciona para o login
                    localStorage.removeItem('authToken');
                    window.location.href = 'index.html';
                }
            });
        });
    }

    // Carrega a lista de personagens do usuário
    await loadCharacters(token);
});

/**
 * Busca os personagens na API e renderiza os cards na interface.
 * @param {string} token - Token JWT para autenticação na API.
 */
async function loadCharacters(token) {
    const listElement = document.getElementById('charList');
    // Exibe indicador de carregamento
    listElement.innerHTML = '<div class="text-center text-secondary mt-5"><i class="fa-solid fa-circle-notch fa-spin fa-2x"></i><p class="mt-2">Carregando fichas...</p></div>';

    try {
        // Requisição GET para listar personagens
        const response = await fetch('https://bloodcrown-api.onrender.com/characters', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) throw new Error('Falha ao buscar fichas');

        const characters = await response.json();
        listElement.innerHTML = ''; 

        // Itera sobre os personagens para criar os elementos HTML (Cards)
        characters.forEach(char => {
            const initial = char.name ? char.name.charAt(0).toUpperCase() : '?';
            const charClass = char.characterClass || 'Desconhecido';
            const charLevel = char.level || 1;

            const col = document.createElement('div');
            col.className = 'col-12 col-md-6 col-lg-4 col-xl-3';
            
            // Estrutura do Card do Personagem
            col.innerHTML = `
                <div class="card char-card p-4 text-center h-100">
                    <button class="btn-delete" title="Excluir Ficha" onclick="deleteCharacter(event, '${char.id}', '${token}')">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                    
                    <div class="d-flex justify-content-center">
                        <div class="char-avatar shadow-sm">
                            ${initial}
                        </div>
                    </div>
                    
                    <h5 class="text-light fw-bold mb-1 text-truncate">${char.name}</h5>
                    <p class="text-secondary small mb-3">${charClass} • Nível ${charLevel}</p>
                    
                    <div class="mt-auto">
                        <span class="btn btn-sm btn-outline-secondary w-100 rounded-pill" style="font-size: 0.8rem;">Abrir Ficha</span>
                    </div>
                </div>
            `;

            // Adiciona evento de clique no card para abrir a ficha
            const cardDiv = col.querySelector('.char-card');
            cardDiv.addEventListener('click', (e) => {
                // Impede que o clique no botão de deletar abra a ficha
                if(e.target.closest('.btn-delete')) return;
                window.location.href = `Sheet.html?id=${char.id}`;
            });

            listElement.appendChild(col);
        });

        // Adiciona o Card especial de "Novo Personagem" no final da lista
        const addCol = document.createElement('div');
        addCol.className = 'col-12 col-md-6 col-lg-4 col-xl-3';
        addCol.innerHTML = `
            <div class="btn-add-card" onclick="createCharacter('${token}')">
                <i class="fa-solid fa-plus-circle"></i>
                <span class="fw-bold">Novo Personagem</span>
            </div>
        `;
        listElement.appendChild(addCol);

    } catch (error) {
        console.error(error);
        listElement.innerHTML = '<div class="alert alert-dark text-center w-100">Erro ao carregar dados. Tente fazer login novamente.</div>';
    }
}

/**
 * Cria uma nova ficha de personagem.
 * Envia uma requisição POST para a API e redireciona para a página de edição.
 * @param {string} token - Token de autenticação.
 */
async function createCharacter(token) {
    Swal.fire({
        title: 'Criando...',
        didOpen: () => Swal.showLoading(),
        background: '#212529', color: '#fff'
    });

    try {
        const response = await fetch('https://bloodcrown-api.onrender.com/characters', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Erro ao criar ficha');

        const newChar = await response.json();
        
        // Redireciona para a Sheet.html com o ID do novo personagem
        window.location.href = `Sheet.html?id=${newChar.id}`;

    } catch (error) {
        Swal.fire({ icon: 'error', title: 'Erro', text: 'Não foi possível criar a ficha.', background: '#212529', color: '#fff' });
    }
}

/**
 * Exclui um personagem existente.
 * Solicita confirmação do usuário antes de enviar a requisição DELETE.
 * @param {Event} event - O evento de clique (usado para parar a propagação).
 * @param {string} charId - ID do personagem a ser excluído.
 * @param {string} token - Token de autenticação.
 */
async function deleteCharacter(event, charId, token) {
    event.stopPropagation(); // Impede que o clique no botão dispare o clique no card (abrir ficha)

    const result = await Swal.fire({
        title: 'Excluir Ficha?',
        text: "Essa ação é permanente e não pode ser desfeita.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sim, excluir',
        cancelButtonText: 'Cancelar',
        background: '#212529', color: '#fff'
    });

    if (result.isConfirmed) {
        try {
            const response = await fetch(`https://bloodcrown-api.onrender.com/characters/${charId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Erro ao deletar');

            Swal.fire({
                icon: 'success',
                title: 'Deletado!',
                showConfirmButton: false,
                timer: 1000,
                background: '#212529', color: '#fff'
            });
            
            // Recarrega a lista para refletir a exclusão
            await loadCharacters(token);
        
        } catch (error) {
            Swal.fire({ icon: 'error', text: "Não foi possível deletar a ficha.", background: '#212529', color: '#fff' });
        }
    }
}