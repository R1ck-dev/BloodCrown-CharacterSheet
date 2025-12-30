const categoryMap = {
    'CLASS': 'tabClass',
    'MAGIC': 'tabMagic',
    'AWAKEN': 'tabAwaken',
    'WEAPON': 'tabWeapon',
    'TRANSFORMATION': 'tabTrans',
    'SPECIAL': 'tabSpecial'
};

async function createAbility(characterId, token) {
    const nameEl = document.getElementById('abilName');
    const categoryEl = document.getElementById('abilCategory');
    const actionEl = document.getElementById('abilAction');
    const descEl = document.getElementById('abilDesc');
    
    const maxUsesEl = document.getElementById('abilMaxUses');
    const durationEl = document.getElementById('abilDuration');
    const resourceEl = document.getElementById('abilResource');

    const effectsList = [];
    document.querySelectorAll('#effectsContainer .effect-row').forEach(row => {
        const target = row.querySelector('.effect-target').value;
        const val = parseInt(row.querySelector('.effect-value').value) || 0;
        
        if(target !== 'none' && val !== 0) {
            effectsList.push({ target: target, value: val });
        }
    });

    if (!nameEl || !maxUsesEl) {
        console.error("Erro: Campos do modal não encontrados no HTML.");
        return;
    }

    const data = {
        name: nameEl.value,
        category: categoryEl.value,
        actionType: actionEl.value,
        description: descEl.value,

        resourceType: resourceEl ? resourceEl.value : 'MANA',
        
        maxUses: parseInt(document.getElementById('abilMaxUses').value) || 1, 
        currentUses: parseInt(document.getElementById('abilMaxUses').value) || 1, 
        diceRoll: "",
        
        effects: effectsList,
        
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

        if (!response.ok) throw new Error('Erro ao criar habilidade');

        const newAbility = await response.json();
        renderAbilityCard(newAbility);

        const modalEl = document.getElementById('modalNewAbility');
        const modal = bootstrap.Modal.getInstance(modalEl);
        modal.hide();
        document.getElementById('formAbility').reset();

    } catch (error) {
        console.error(error);
        Swal.fire({ icon: 'error', title: 'Erro', text: "Erro ao salvar habilidade: " + error.message, background: '#212529', color: '#fff', confirmButtonColor: '#7b2cbf' });
    }
}

async function deleteAbility(id, element, token) {
    const result = await Swal.fire({
        title: 'Deletar Habilidade?',
        text: "Essa ação não pode ser desfeita.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sim, deletar',
        cancelButtonText: 'Cancelar',
        background: '#212529', color: '#fff'
    });

    if(!result.isConfirmed) return;

    try {
        await fetch(`http://localhost:8080/abilities/${id}`, { 
            method: 'DELETE', 
            headers: { 'Authorization': `Bearer ${token}` } 
        });
        element.remove();
    } catch (e) { 
        Swal.fire({ icon: 'error', text: "Erro ao deletar.", background: '#212529', color: '#fff', confirmButtonColor: '#7b2cbf' });
    }
}

function renderAbilityCard(ability) {
    const tabId = categoryMap[ability.category];
    const container = document.getElementById(tabId);
    
    if (!container) return;

    const emptyMsg = container.querySelector('p.text-muted');
    if (emptyMsg) emptyMsg.style.display = 'none';

    const card = document.createElement('div');
    card.className = 'ability-card p-3 mb-2 rounded bg-black border border-secondary position-relative';
    
    const hasRoll = ability.diceRoll && ability.diceRoll.match(/\d+d\d+/);
    if(hasRoll) {
        card.style.cursor = 'pointer';
        card.style.borderColor = '#7b2cbf'; 
        card.title = "Clique para rolar: " + ability.diceRoll;
    }

    let btnColorClass = 'text-secondary';
    if (ability.resourceType === 'MANA') btnColorClass = 'text-info';
    if (ability.resourceType === 'STAMINA') btnColorClass = 'text-warning';
    if (ability.resourceType === 'HYBRID') btnColorClass = 'text-white';

    const usesBadge = `
        <div class="d-flex align-items-center gap-1 bg-dark border border-secondary rounded px-2 py-0 ms-1">
            <span class="text-info" style="font-size: 0.8rem;">${ability.currentUses}/${ability.maxUses}</span>
            ${ability.currentUses < ability.maxUses ? 
                `<i class="fa-solid fa-circle-plus ${btnColorClass} clickable-icon btn-recover" title="Gastar 50 para recuperar"></i>` 
                : ''}
        </div>
    `;
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
            <button type="button" class="btn btn-sm btn-link text-secondary p-0 btn-del-abil"><i class="fa-solid fa-trash"></i></button>
        </div>
        
        <p class="text-secondary small mb-0 text-break" style="white-space: pre-wrap;">${ability.description}</p>
        
        <div class="d-flex justify-content-between align-items-end mt-2">
            <div>
                ${ (ability.targetAttribute !== 'none' || ability.durationDice) ? 
                    `<button type="button" class="btn btn-sm btn-outline-warning py-0 px-2 small btn-activate" style="font-size: 0.7rem;">ATIVAR</button>` 
                    : '' 
                }
            </div>
            ${hasRoll ? `<div class="text-purple small fw-bold"><i class="fa-solid fa-dice-d20"></i> ${ability.diceRoll}</div>` : ''}
        </div>
    `;

    card.querySelector('.btn-del-abil').addEventListener('click', (e) => {
        e.stopPropagation();
        deleteAbility(ability.id, card, localStorage.getItem('authToken'));
    });

    const btnActivate = card.querySelector('.btn-activate');
    if(btnActivate) {
        if (ability.isActive) {
            btnActivate.classList.replace('btn-outline-warning', 'btn-warning');
            btnActivate.innerText = "DESATIVAR";
        }
        btnActivate.addEventListener('click', (e) => {
            e.stopPropagation();
            const token = localStorage.getItem('authToken');
            toggleAbility(ability.id, token);
        });
    }

    if(hasRoll) {
        card.addEventListener('click', (e) => {
            if(e.target.closest('button')) return; 
            rollDamage(ability.diceRoll, `Habilidade: ${ability.name}`);
        });
    }

    const btnRecover = card.querySelector('.btn-recover');
    if(btnRecover) {
        btnRecover.addEventListener('click', (e) => {
            e.stopPropagation();
            recoverAbilityUse(ability.id, ability.resourceType, localStorage.getItem('authToken'));
        });
    }

    container.appendChild(card);
}

async function toggleAbility(abilityId, token) {
    try {
        const response = await fetch(`http://localhost:8080/abilities/${abilityId}/toggle`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            const errorMsg = await response.text();
            throw new Error(errorMsg || 'Erro ao ativar habilidade');
        } 

        const params = new URLSearchParams(window.location.search);
        const charId = params.get('id');
        
        if(window.loadCharacterData) {
            window.loadCharacterData(charId, token);
        }

    } catch (error) {
        console.error(error);
        Swal.fire({ icon: 'error', text: "Erro na ativação.", background: '#212529', color: '#fff', confirmButtonColor: '#7b2cbf' });
    }
}

async function recoverAbilityUse(abilityId, resourceType, token) {
    let resourceToSpend = resourceType;

    if (resourceType === 'HYBRID') {
        // Modal Especial para Híbridos
        const result = await Swal.fire({
            title: 'Recuperar Uso',
            text: "Qual recurso deseja gastar?",
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Mana (50)',
            cancelButtonText: 'Estamina (50)',
            confirmButtonColor: '#0dcaf0', // Ciano
            cancelButtonColor: '#ffc107',  // Amarelo
            background: '#212529', color: '#fff'
        });
        
        // Se confirmou = Mana, se cancelou (mas não fechou) = Estamina
        // A biblioteca trata o botão "cancelar" como dismiss. Precisamos verificar se foi um dismiss por clique no botão.
        if (result.isConfirmed) {
            resourceToSpend = 'MANA';
        } else if (result.dismiss === Swal.DismissReason.cancel) {
            resourceToSpend = 'STAMINA';
        } else {
            return; // Clicou fora ou esc
        }
    }

    try {
        const response = await fetch(`http://localhost:8080/abilities/${abilityId}/recover?resource=${resourceToSpend}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            const msg = await response.text();
            throw new Error(msg || "Erro ao recuperar uso.");
        }

        const params = new URLSearchParams(window.location.search);
        const charId = params.get('id');
        if(window.loadCharacterData) window.loadCharacterData(charId, token);

    } catch (error) {
        Swal.fire({ icon: 'error', text: error.message, background: '#212529', color: '#fff', confirmButtonColor: '#7b2cbf' });
    }
}

function addEffectRow() {
    const container = document.getElementById('effectsContainer');
    const template = document.getElementById('effectRowTemplate');
    const clone = template.content.cloneNode(true);
    container.appendChild(clone);
}