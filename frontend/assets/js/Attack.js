async function createAttack(characterId, token) {
    const name = document.getElementById('atkName').value;
    const damage = document.getElementById('atkDamage').value; 
    const desc = document.getElementById('atkDesc').value;

    // Validação de formato de dado (Ex: 1d8)
    if(!damage.match(/\d+d\d+/)) {
        alert("A fórmula de dano precisa ter pelo menos um dado (ex: 1d6).");
        return;
    }

    const attackData = {
        name: name,
        damageDice: damage,
        description: desc
    };

    try {
        const response = await fetch(`http://localhost:8080/attacks/${characterId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(attackData)
        });

        if (!response.ok) throw new Error('Erro ao criar ataque');

        const newAttack = await response.json();

        renderAttackCard(newAttack);

        const modalEl = document.getElementById('modalNewAttack'); 
        const modal = bootstrap.Modal.getInstance(modalEl);
        modal.hide();

        document.getElementById('formAttack').reset();

    } catch (error) {
        console.error(error);
        alert("Erro ao salvar ataque.");
    }
}

async function deleteAttack(attackId, elementToRemove, token) {
    if (!confirm("Tem certeza que deseja apagar este ataque?")) return;
    try {
        const response = await fetch(`http://localhost:8080/attacks/${attackId}`, {
            method: 'DELETE',
            headers: {'Authorization': `Bearer ${token}`}
        });
        if (!response.ok) throw new Error('Erro ao deletar');
        elementToRemove.remove();
    } catch (error) {
        alert("Erro ao remover ataque.");
    }
}

function renderAttackCard(attack) {
    const container = document.getElementById('tabCombat'); 

    if (container.querySelector('.text-muted') || !container.querySelector('.attacks-grid')) {
        const btnCreate = container.querySelector('#btnOpenAttackModal'); 
        container.innerHTML = ''; 
        if(btnCreate) {
            const divBtn = document.createElement('div');
            divBtn.className = 'text-center mt-3 mb-3';
            divBtn.appendChild(btnCreate); 
            container.appendChild(divBtn);
        }
        
        const grid = document.createElement('div');
        grid.className = 'attacks-grid d-flex flex-column gap-2';
        container.appendChild(grid);
    }

    const list = container.querySelector('.attacks-grid');

    const card = document.createElement('div');
    card.className = 'attack-card p-3 rounded bg-black border border-secondary d-flex justify-content-between align-items-center';

    card.innerHTML = `
        <div class="d-flex flex-column" style="max-width: 70%;">
            <strong class="text-light fs-5 mb-1">${attack.name}</strong>
            <small class="text-secondary text-break" style="font-size: 0.8rem;">${attack.description || ''}</small>
        </div>
        
        <div class="d-flex align-items-center gap-3">
            <div class="text-end pointer-events-none"> 
                <div class="text-danger fw-bold fs-4">${attack.damageDice}</div>
                <small class="text-secondary" style="font-size: 0.7rem;">ROLAR DANO</small>
            </div>
            
            <div style="border-left: 1px solid #333; height: 30px; margin: 0 5px;"></div>

            <button type="button" class="btn btn-sm btn-outline-dark text-secondary border-0 btn-delete-atk" title="Apagar">
                <i class="fa-solid fa-trash"></i>
            </button>
        </div>
    `;

    card.querySelector('.btn-delete-atk').addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const token = localStorage.getItem('authToken');
        deleteAttack(attack.id, card, token);
    });

    card.style.cursor = "pointer";
    card.addEventListener('click', (e) => {
        if (e.target.closest('.btn-delete-atk')) return;

        if (attack.damageDice) {
            rollDamage(attack.damageDice, `Dano: ${attack.name}`);
        }
    });

    list.appendChild(card);
}