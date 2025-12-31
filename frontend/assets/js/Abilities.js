/*
    Gerenciador de Habilidades, Magias e Poderes.
    Controla todo o ciclo de vida das habilidades na ficha: criação, exclusão,
    ativação de efeitos, recuperação de usos e renderização na interface.
*/

// Mapeia as categorias de habilidade (Enums) para os IDs das abas no HTML.
const categoryMap = {
    'CLASS': 'tabClass',
    'MAGIC': 'tabMagic',
    'AWAKEN': 'tabAwaken',
    'WEAPON': 'tabWeapon',
    'TRANSFORMATION': 'tabTrans',
    'SPECIAL': 'tabSpecial'
};

/**
 * Cria uma nova habilidade para o personagem.
 * Coleta dados do formulário modal, processa a lista de efeitos dinâmicos
 * e envia para a API.
 * @param {string} characterId - ID do personagem.
 * @param {string} token - Token de autenticação.
 */
async function createAbility(characterId, token) {
    // Referências aos elementos do formulário
    const nameEl = document.getElementById('abilName');
    const categoryEl = document.getElementById('abilCategory');
    const actionEl = document.getElementById('abilAction');
    const descEl = document.getElementById('abilDesc');
    
    const maxUsesEl = document.getElementById('abilMaxUses');
    const durationEl = document.getElementById('abilDuration');
    const resourceEl = document.getElementById('abilResource');

    // Coleta a lista de efeitos adicionados dinamicamente no modal
    const effectsList = [];
    document.querySelectorAll('#effectsContainer .effect-row').forEach(row => {
        const target = row.querySelector('.effect-target').value;
        const val = parseInt(row.querySelector('.effect-value').value) || 0;
        
        // Apenas adiciona se tiver um alvo válido e valor diferente de zero
        if(target !== 'none' && val !== 0) {
            effectsList.push({ target: target, value: val });
        }
    });

    // Validação básica de campos obrigatórios
    if (!nameEl || !maxUsesEl) {
        console.error("Erro: Campos do modal não encontrados no HTML.");
        return;
    }

    // Monta o objeto de dados (Payload)
    const data = {
        name: nameEl.value,
        category: categoryEl.value,
        actionType: actionEl.value,
        description: descEl.value,

        resourceType: resourceEl ? resourceEl.value : 'MANA',
        
        // Define usos atuais iguais aos máximos na criação
        maxUses: parseInt(document.getElementById('abilMaxUses').value) || 1, 
        currentUses: parseInt(document.getElementById('abilMaxUses').value) || 1, 
        diceRoll: "", // Campo reservado para futura implementação de rolagem específica na criação
        
        effects: effectsList,
        
        durationDice: durationEl ? durationEl.value : '',
        isActive: false,
        turnsRemaining: 0
    };

    try {
        // Envia requisição POST para criar a habilidade
        const response = await fetch(`https://bloodcrown-api.onrender.com/abilities/${characterId}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (!response.ok) throw new Error('Erro ao criar habilidade');

        const newAbility = await response.json();
        // Renderiza a nova habilidade na aba correta imediatamente
        renderAbilityCard(newAbility);

        // Fecha o modal e reseta o formulário
        const modalEl = document.getElementById('modalNewAbility');
        const modal = bootstrap.Modal.getInstance(modalEl);
        modal.hide();
        document.getElementById('formAbility').reset();

    } catch (error) {
        console.error(error);
        Swal.fire({ icon: 'error', title: 'Erro', text: "Erro ao salvar habilidade: " + error.message, background: '#212529', color: '#fff', confirmButtonColor: '#7b2cbf' });
    }
}

/**
 * Remove uma habilidade da ficha.
 * @param {string} id - ID da habilidade.
 * @param {HTMLElement} element - O elemento HTML do card (para remoção visual).
 * @param {string} token - Token de autenticação.
 */
async function deleteAbility(id, element, token) {
    // Solicita confirmação do usuário
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
        // Envia requisição DELETE
        await fetch(`https://bloodcrown-api.onrender.com/abilities/${id}`, { 
            method: 'DELETE', 
            headers: { 'Authorization': `Bearer ${token}` } 
        });
        // Remove do DOM se sucesso
        element.remove();
    } catch (e) { 
        Swal.fire({ icon: 'error', text: "Erro ao deletar.", background: '#212529', color: '#fff', confirmButtonColor: '#7b2cbf' });
    }
}

/**
 * Constrói e insere o card de uma habilidade na aba correspondente.
 * Lida com a lógica visual de status (ativo/inativo), badges de tipo e
 * botões de interação (ativar, rolar, recuperar, excluir).
 * @param {Object} ability - Dados da habilidade.
 */
function renderAbilityCard(ability) {
    // Determina o container correto com base na categoria
    const tabId = categoryMap[ability.category];
    const container = document.getElementById(tabId);
    
    if (!container) return;

    // Remove mensagem de "lista vazia" se existir
    const emptyMsg = container.querySelector('p.text-muted');
    if (emptyMsg) emptyMsg.style.display = 'none';

    // Cria o elemento card
    const card = document.createElement('div');
    card.className = 'ability-card p-3 mb-2 rounded bg-black border border-secondary position-relative';
    
    // Verifica se há fórmula de rolagem para habilitar o clique
    const hasRoll = ability.diceRoll && ability.diceRoll.match(/\d+d\d+/);
    if(hasRoll) {
        card.style.cursor = 'pointer';
        card.style.borderColor = '#7b2cbf'; 
        card.title = "Clique para rolar: " + ability.diceRoll;
    }

    // Define cor do ícone de recuperação baseado no recurso
    let btnColorClass = 'text-secondary';
    if (ability.resourceType === 'MANA') btnColorClass = 'text-info';
    if (ability.resourceType === 'STAMINA') btnColorClass = 'text-warning';
    if (ability.resourceType === 'HYBRID') btnColorClass = 'text-white';

    // Badge de Usos com botão de recuperação condicional
    const usesBadge = `
        <div class="d-flex align-items-center gap-1 bg-dark border border-secondary rounded px-2 py-0 ms-1">
            <span class="text-info" style="font-size: 0.8rem;">${ability.currentUses}/${ability.maxUses}</span>
            ${ability.currentUses < ability.maxUses ? 
                `<i class="fa-solid fa-circle-plus ${btnColorClass} clickable-icon btn-recover" title="Gastar 50 para recuperar"></i>` 
                : ''}
        </div>
    `;
    const actionBadge = ability.actionType ? `<span class="badge bg-secondary">${ability.actionType}</span>` : '';

    // Monta o HTML interno
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

    // Evento de Deletar
    card.querySelector('.btn-del-abil').addEventListener('click', (e) => {
        e.stopPropagation();
        deleteAbility(ability.id, card, localStorage.getItem('authToken'));
    });

    // Evento de Ativar/Desativar (Toggle)
    const btnActivate = card.querySelector('.btn-activate');
    if(btnActivate) {
        // Altera o estilo se já estiver ativa
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

    // Evento de Rolagem de Dados (se aplicável)
    if(hasRoll) {
        card.addEventListener('click', (e) => {
            if(e.target.closest('button')) return; // Ignora cliques nos botões internos
            rollDamage(ability.diceRoll, `Habilidade: ${ability.name}`);
        });
    }

    // Evento de Recuperar Uso
    const btnRecover = card.querySelector('.btn-recover');
    if(btnRecover) {
        btnRecover.addEventListener('click', (e) => {
            e.stopPropagation();
            recoverAbilityUse(ability.id, ability.resourceType, localStorage.getItem('authToken'));
        });
    }

    container.appendChild(card);
}

/**
 * Alterna o estado de ativação da habilidade.
 * Envia requisição para a API e recarrega a ficha para aplicar/remover efeitos.
 * @param {string} abilityId - ID da habilidade.
 * @param {string} token - Token de autenticação.
 */
async function toggleAbility(abilityId, token) {
    try {
        const response = await fetch(`https://bloodcrown-api.onrender.com/abilities/${abilityId}/toggle`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            const errorMsg = await response.text();
            throw new Error(errorMsg || 'Erro ao ativar habilidade');
        } 

        // Recarrega a ficha para atualizar bônus de status e cooldowns
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

/**
 * Recupera um uso gasto da habilidade consumindo recursos (Mana/Estamina).
 * Lida com a escolha do recurso em caso de habilidades híbridas.
 * @param {string} abilityId - ID da habilidade.
 * @param {string} resourceType - Tipo de recurso (MANA, STAMINA, HYBRID).
 * @param {string} token - Token de autenticação.
 */
async function recoverAbilityUse(abilityId, resourceType, token) {
    let resourceToSpend = resourceType;

    // Se for híbrido, pergunta ao usuário qual recurso gastar
    if (resourceType === 'HYBRID') {
        const result = await Swal.fire({
            title: 'Recuperar Uso',
            text: "Qual recurso deseja gastar?",
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Mana (50)',
            cancelButtonText: 'Estamina (50)',
            confirmButtonColor: '#0dcaf0', 
            cancelButtonColor: '#ffc107',  
            background: '#212529', color: '#fff'
        });
        if (result.isConfirmed) {
            resourceToSpend = 'MANA';
        } else if (result.dismiss === Swal.DismissReason.cancel) {
            resourceToSpend = 'STAMINA';
        } else {
            return; // Cancela se o usuário fechar o modal
        }
    }

    try {
        // Envia requisição com o recurso escolhido
        const response = await fetch(`https://bloodcrown-api.onrender.com/abilities/${abilityId}/recover?resource=${resourceToSpend}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            const msg = await response.text();
            throw new Error(msg || "Erro ao recuperar uso.");
        }

        // Recarrega a ficha para atualizar as barras de recurso
        const params = new URLSearchParams(window.location.search);
        const charId = params.get('id');
        if(window.loadCharacterData) window.loadCharacterData(charId, token);

    } catch (error) {
        Swal.fire({ icon: 'error', text: error.message, background: '#212529', color: '#fff', confirmButtonColor: '#7b2cbf' });
    }
}

/**
 * Adiciona dinamicamente uma nova linha de efeito no formulário de criação.
 * Clona o template HTML e insere no container de efeitos.
 */
function addEffectRow() {
    const container = document.getElementById('effectsContainer');
    const template = document.getElementById('effectRowTemplate');
    const clone = template.content.cloneNode(true);
    container.appendChild(clone);
}