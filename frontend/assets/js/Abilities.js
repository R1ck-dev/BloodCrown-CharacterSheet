/* assets/js/Abilities.js */

const categoryMap = {
    'CLASS': 'tabClass',
    'MAGIC': 'tabMagic',
    'AWAKEN': 'tabAwaken',
    'WEAPON': 'tabWeapon',
    'TRANSFORMATION': 'tabTrans',
    'SPECIAL': 'tabSpecial'
};

async function createAbility(characterId, token) {
    // 1. Captura os elementos do HTML
    const nameEl = document.getElementById('abilName');
    const categoryEl = document.getElementById('abilCategory');
    const actionEl = document.getElementById('abilAction');
    const descEl = document.getElementById('abilDesc');
    
    // ATENÇÃO: Estes são os novos campos. Não existe mais 'abilCost'
    const maxUsesEl = document.getElementById('abilMaxUses');
    const diceEl = document.getElementById('abilDice');
    const targetEl = document.getElementById('abilTarget');
    const effectEl = document.getElementById('abilEffectValue');
    const durationEl = document.getElementById('abilDuration');

    // Se algum campo essencial não for encontrado, para tudo para não dar erro
    if (!nameEl || !maxUsesEl) {
        console.error("Erro: Campos do modal não encontrados no HTML.");
        return;
    }

    // 2. Monta o objeto JSON (igual ao AbilityDTO do Java)
    const data = {
        name: nameEl.value,
        category: categoryEl.value,
        actionType: actionEl.value,
        description: descEl.value,
        
        // Novos campos de automação
        maxUses: parseInt(maxUsesEl.value) || 1, 
        currentUses: parseInt(maxUsesEl.value) || 1, // Começa cheio
        diceRoll: diceEl ? diceEl.value : '',
        
        targetAttribute: targetEl ? targetEl.value : 'none',
        effectValue: parseInt(effectEl.value) || 0,
        
        durationDice: durationEl ? durationEl.value : '',
        isActive: false,
        turnsRemaining: 0
    };

    try {
        const response = await fetch(`http://localhost:8080/abilities/${characterId}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (!response.ok) throw new Error('Erro ao criar habilidade (Backend recusou)');

        const newAbility = await response.json();
        renderAbilityCard(newAbility);

        // Fecha modal e limpa
        const modalEl = document.getElementById('modalNewAbility');
        const modal = bootstrap.Modal.getInstance(modalEl);
        modal.hide();
        document.getElementById('formAbility').reset();

    } catch (error) {
        console.error(error);
        alert("Erro ao salvar habilidade: " + error.message);
    }
}

async function deleteAbility(id, element, token) {
    if(!confirm("Deletar habilidade?")) return;
    try {
        await fetch(`http://localhost:8080/abilities/${id}`, { 
            method: 'DELETE', 
            headers: { 'Authorization': `Bearer ${token}` } 
        });
        element.remove();
    } catch (e) { alert("Erro ao deletar"); }
}

function renderAbilityCard(ability) {
    const tabId = categoryMap[ability.category];
    const container = document.getElementById(tabId);
    
    if (!container) return;

    // Remove mensagem de vazio
    const emptyMsg = container.querySelector('p.text-muted');
    if (emptyMsg) emptyMsg.style.display = 'none';

    const card = document.createElement('div');
    card.className = 'ability-card p-3 mb-2 rounded bg-black border border-secondary position-relative';
    
    // Verifica se tem rolagem
    const hasRoll = ability.diceRoll && ability.diceRoll.match(/\d+d\d+/);
    if(hasRoll) {
        card.style.cursor = 'pointer';
        card.style.borderColor = '#7b2cbf'; 
        card.title = "Clique para rolar: " + ability.diceRoll;
    }

    // Badges visuais
    const usesBadge = `<span class="badge bg-dark border border-secondary text-info ms-1">${ability.currentUses}/${ability.maxUses} Usos</span>`;
    const actionBadge = ability.actionType ? `<span class="badge bg-secondary">${ability.actionType}</span>` : '';

    card.innerHTML = `
        <div class="d-flex justify-content-between align-items-start mb-2">
            <div>
                <strong class="text-light d-block">${ability.name}</strong>
                <div class="d-flex gap-2 small mt-1">
                    ${actionBadge}
                    ${usesBadge}
                </div>
            </div>
            <button class="btn btn-sm btn-link text-secondary p-0 btn-del-abil"><i class="fa-solid fa-trash"></i></button>
        </div>
        
        <p class="text-secondary small mb-0 text-break" style="white-space: pre-wrap;">${ability.description}</p>
        
        <div class="d-flex justify-content-between align-items-end mt-2">
            <div>
                ${ (ability.targetAttribute !== 'none' || ability.durationDice) ? 
                   `<button class="btn btn-sm btn-outline-warning py-0 px-2 small btn-activate" style="font-size: 0.7rem;">ATIVAR</button>` 
                   : '' 
                }
            </div>
            ${hasRoll ? `<div class="text-purple small fw-bold"><i class="fa-solid fa-dice-d20"></i> ${ability.diceRoll}</div>` : ''}
        </div>
    `;

    // Eventos
    card.querySelector('.btn-del-abil').addEventListener('click', (e) => {
        e.stopPropagation();
        deleteAbility(ability.id, card, localStorage.getItem('authToken'));
    });

    const btnActivate = card.querySelector('.btn-activate');
    if(btnActivate) {
        btnActivate.addEventListener('click', (e) => {
            e.stopPropagation();
            alert("Ativar: " + ability.name + " (Lógica vem a seguir)");
        });
    }

    if(hasRoll) {
        card.addEventListener('click', (e) => {
            if(e.target.closest('button')) return; 
            rollDamage(ability.diceRoll, `Habilidade: ${ability.name}`);
        });
    }

    container.appendChild(card);
}