document.addEventListener('DOMContentLoaded', async function() {
    const token = localStorage.getItem('authToken');

    // 1. Verifica Login
    if (!token) {
        window.location.href = 'index.html';
        return;
    }
    
    // 2. Configura Logout
    const btnLogout = document.getElementById('btnLogout');
    if(btnLogout) {
        btnLogout.addEventListener('click', function() {
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
                    localStorage.removeItem('authToken');
                    window.location.href = 'index.html';
                }
            });
        });
    }

    // 3. Carrega Fichas
    await loadCharacters(token);
});

// --- FUNÇÕES ---

async function loadCharacters(token) {
    const listElement = document.getElementById('charList');
    listElement.innerHTML = '<div class="text-center text-secondary mt-5"><i class="fa-solid fa-circle-notch fa-spin fa-2x"></i><p class="mt-2">Carregando fichas...</p></div>';

    try {
        const response = await fetch('http://localhost:8080/characters', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) throw new Error('Falha ao buscar fichas');

        const characters = await response.json();
        listElement.innerHTML = ''; // Limpa loading

        // Renderiza cada personagem
        characters.forEach(char => {
            const initial = char.name ? char.name.charAt(0).toUpperCase() : '?';
            const charClass = char.characterClass || 'Desconhecido';
            const charLevel = char.level || 1;

            const col = document.createElement('div');
            col.className = 'col-12 col-md-6 col-lg-4 col-xl-3';
            
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

            // Clique no card abre a ficha
            const cardDiv = col.querySelector('.char-card');
            cardDiv.addEventListener('click', (e) => {
                // Se clicou no lixo, não abre
                if(e.target.closest('.btn-delete')) return;
                window.location.href = `Sheet.html?id=${char.id}`;
            });

            listElement.appendChild(col);
        });

        // Adiciona o Card de "Criar Novo" no final
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

async function createCharacter(token) {
    // Feedback visual (pode ser um Toast ou Loading)
    Swal.fire({
        title: 'Criando...',
        didOpen: () => Swal.showLoading(),
        background: '#212529', color: '#fff'
    });

    try {
        const response = await fetch('http://localhost:8080/characters', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Erro ao criar ficha');

        const newChar = await response.json();
        
        // Redireciona direto
        window.location.href = `Sheet.html?id=${newChar.id}`;

    } catch (error) {
        Swal.fire({ icon: 'error', title: 'Erro', text: 'Não foi possível criar a ficha.', background: '#212529', color: '#fff' });
    }
}

async function deleteCharacter(event, charId, token) {
    event.stopPropagation(); // Impede de abrir a ficha ao clicar no lixo

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
            const response = await fetch(`http://localhost:8080/characters/${charId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Erro ao deletar');

            // Sucesso e Recarrega
            Swal.fire({
                icon: 'success',
                title: 'Deletado!',
                showConfirmButton: false,
                timer: 1000,
                background: '#212529', color: '#fff'
            });
            
            await loadCharacters(token);
        
        } catch (error) {
            Swal.fire({ icon: 'error', text: "Não foi possível deletar a ficha.", background: '#212529', color: '#fff' });
        }
    }
}