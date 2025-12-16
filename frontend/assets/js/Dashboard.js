document.addEventListener('DOMContentLoaded', async function() {

    const token = localStorage.getItem('authToken');

    if (!token) {
        alert('Você precisa estar logado para acessar está área.');
        window.location.href = 'index.html';
        return;
    }
    
    const btnLogout = document.getElementById('btnLogout');
    if(btnLogout) {
        btnLogout.addEventListener('click', function() {
            localStorage.removeItem('authToken');
            window.location.href = 'index.html';
        });
    }

    const btnNewChar = document.getElementById('btnNewChar');
    if(btnNewChar) {
        btnNewChar.addEventListener('click', async function() {
            try {
                const originalText = btnNewChar.innerText;
                btnNewChar.innerText = "⏳";

                const response = await fetch('http://localhost:8080/characters', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) throw new Error('Erro ao criar ficha');

                const newChar = await response.json();

                console.log("Ficha criada! ID: ", newChar.id);
                window.location.href = `sheet.html?id=${newChar.id}`;
            } catch (error) {

            }
        })
    }
    
    await loadCharacters(token);

});

async function loadCharacters(token) {
    const listElement = document.getElementById('charactersList');

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

        listElement.innerHTML = '';

        if (characters.length === 0) {
            listElement.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--gray);">Nenhum personagem encontrado. Crie sua primeira ficha!</p>';
            return;
        }

        characters.forEach(char => {
            const card = document.createElement('div');
            card.className = 'char-card';

            const initial = char.name.charAt(0).toUpperCase();

            card.innerHTML = `
                <div class="char-img-placeholder">${initial}</div>
                <div class="char-info">
                    <h3>${char.name}</h3>
                    <span>${char.characterClass} • Nvl ${char.level}</span>
                </div>
            `;

            listElement.appendChild(card);
        });
    } catch (error) {
        console.error(error);
        listElement.innerHTML = '<p style="color: red;">Erro ao carregar dados.</p>';
    }
}