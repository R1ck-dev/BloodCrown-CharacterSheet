/*
    Controlador Principal da Ficha de Personagem (Sheet).
    Responsável por carregar dados, manipular a interface (DOM), gerenciar cálculos automáticos
    (como barras de vida e bônus) e realizar a persistência de dados (Salvar/Auto-save).
*/

// Configuração global do componente de notificação (Toast) do SweetAlert2.
const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    background: '#212529',
    color: '#f8f9fa',
    didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
});

/**
 * Função utilitária para limitar a frequência de execução de uma função.
 * Utilizada principalmente no Auto-Save para evitar requisições excessivas ao servidor.
 * @param {Function} func - A função a ser executada.
 * @param {number} delay - O tempo de espera em milissegundos.
 */
function debounce(func, delay) {
    let timer;
    return function(...args) {
        clearTimeout(timer);
        timer = setTimeout(() => func.apply(this, args), delay);
    };
}

/**
 * Recupera o valor inteiro de um input.
 * Prioriza o atributo 'data-base-value' se existir (valor original sem buffs),
 * caso contrário, usa o valor atual do input.
 * @param {string} id - O ID do elemento HTML.
 */
const getRawValue = (id) => {
    const el = document.getElementById(id);
    if (!el) return 0;
    if (el.dataset.baseValue !== undefined && el.dataset.baseValue !== null) {
        return parseInt(el.dataset.baseValue) || 0;
    }
    return parseInt(el.value) || 0;
};

/**
 * Define o valor de um input e atualiza seu 'data-base-value'.
 * Essencial para distinguir entre o valor base do atributo e o valor modificado por itens/habilidades.
 * @param {string} id - O ID do elemento.
 * @param {number} val - O valor a ser definido.
 */
const setInputAndBase = (id, val) => {
    const el = document.getElementById(id);
    if (el) {
        const safeVal = val || 0;
        el.value = safeVal;
        el.dataset.baseValue = safeVal; 
    }
};

/**
 * Função principal de carregamento da ficha.
 * Busca os dados na API e popula todos os campos da interface.
 * @param {string} id - ID do personagem.
 * @param {string} token - Token JWT de autenticação.
 */
window.loadCharacterData = async function(id, token) {
    try {
        console.log("Atualizando ficha...", id);
        
        // Exibe loading enquanto busca dados
        Swal.fire({
            title: 'Carregando...',
            background: '#000',
            color: '#fff',
            didOpen: () => { Swal.showLoading() }
        });

        // Chama o serviço de API para buscar o JSON completo da ficha
        const charData = await getCharacterById(id, token);
        Swal.close(); 

        // Popula campos de texto simples
        document.getElementById('charName').value = charData.name;
        document.getElementById('charClass').value = charData.characterClass;
        document.getElementById('charLevel').value = charData.level;

        if(document.getElementById('charMoney')) document.getElementById('charMoney').value = charData.money || "";
        if(document.getElementById('charBio')) document.getElementById('charBio').value = charData.biography || "";
        if(document.getElementById('charHeroPoint')) document.getElementById('charHeroPoint').checked = (charData.heroPoint === 1);

        // Popula Atributos
        if(charData.attributes) {
            setInputAndBase('attrForca', charData.attributes.forca);
            setInputAndBase('attrDestreza', charData.attributes.destreza);
            setInputAndBase('attrConstituicao', charData.attributes.constituicao);
            setInputAndBase('attrInteligencia', charData.attributes.inteligencia);
            setInputAndBase('attrSabedoria', charData.attributes.sabedoria);
            setInputAndBase('attrCarisma', charData.attributes.carisma);
        }

        // Popula Status e Barras de Progresso
        if(charData.status) {
            setInputAndBase('statusDefense', charData.status.defense);
            setInputAndBase('defBase', charData.status.defenseBase ?? 10);
            setInputAndBase('defArmor', charData.status.armorBonus);
            setInputAndBase('defOther', charData.status.otherBonus);
            setInputAndBase('resPhysical', charData.status.physicalRes);
            setInputAndBase('resMagical', charData.status.magicalRes);

            // Função auxiliar para atualizar inputs de valor Atual/Máximo
            const updateBarValue = (currentId, maxId, currentVal, maxVal) => {
                setInputAndBase(currentId, currentVal ?? maxVal);
                setInputAndBase(maxId, maxVal);
                const cEl = document.getElementById(currentId);
                if(cEl) cEl.dispatchEvent(new Event('input')); // Dispara evento para atualizar visualmente a barra
            };

            updateBarValue('statusHealthCurrent', 'statusMaxHealth', charData.status.currentHealth, charData.status.maxHealth);
            updateBarValue('statusManaCurrent', 'statusMaxMana', charData.status.currentMana, charData.status.maxMana);
            updateBarValue('statusSanityCurrent', 'statusMaxSanity', charData.status.currentSanity, charData.status.maxSanity);
            updateBarValue('statusStaminaCurrent', 'statusMaxStamina', charData.status.currentStamina, charData.status.maxStamina);

            // Força a renderização visual das barras de progresso (CSS width %)
            const forceBarUpdate = (currentId, maxId, barId) => {
                const currentEl = document.getElementById(currentId);
                const maxEl = document.getElementById(maxId);
                const barEl = document.getElementById(barId);
                if (currentEl && maxEl && barEl) {
                    const current = parseInt(currentEl.value) || 0;
                    const max = parseInt(maxEl.value) || 0;
                    let percentage = 0;
                    if (max > 0) percentage = Math.min(100, Math.max(0, (current / max) * 100));
                    barEl.style.width = `${percentage}%`;
                }
            };
            forceBarUpdate('statusHealthCurrent', 'statusMaxHealth', 'barHealth');
            forceBarUpdate('statusManaCurrent', 'statusMaxMana', 'barMana');
            forceBarUpdate('statusSanityCurrent', 'statusMaxSanity', 'barSanity');
            forceBarUpdate('statusStaminaCurrent', 'statusMaxStamina', 'barStamina');

            // Inicializa eventos de cálculo de defesa, se existirem
            if(window.setupDefenseEvents) setupDefenseEvents();
            if(window.calculateDefense) calculateDefense();
        }

        // Popula Perícias (Expertise)
        if(charData.expertise) {
            const skillMap = {
                'skillAtletismo': charData.expertise.atletismo,
                'skillConhecimento': charData.expertise.conhecimento,
                'skillConsertar': charData.expertise.consertar,
                'skillDiplomacia': charData.expertise.diplomacia,
                'skillDomar': charData.expertise.domar,
                'skillEmpatia': charData.expertise.empatia,
                'skillFortitude': charData.expertise.fortitude,
                'skillFurtividade': charData.expertise.furtividade,
                'skillMagia': charData.expertise.magia,
                'skillIniciativa': charData.expertise.iniciativa,
                'skillIntimidar': charData.expertise.intimidar,
                'skillIntuicao': charData.expertise.intuicao,
                'skillInvestigacao': charData.expertise.investigacao,
                'skillLabia': charData.expertise.labia,
                'skillLadinagem': charData.expertise.ladinagem,
                'skillLuta': charData.expertise.luta,
                'skillMedicina': charData.expertise.medicina,
                'skillMente': charData.expertise.mente,
                'skillPercepcao': charData.expertise.percepcao,
                'skillPontaria': charData.expertise.pontaria,
                'skillReflexos': charData.expertise.reflexos,
                'skillSeduzir': charData.expertise.seduzir,
                'skillSobrevivencia': charData.expertise.sobrevivencia
            };
            for (const [id, value] of Object.entries(skillMap)) {
                setInputAndBase(id, value);
            }
        }

        // Renderiza listas dinâmicas (Ataques, Habilidades, Inventário)
        document.querySelectorAll('.attacks-grid, .ability-card').forEach(e => e.remove());
        if (charData.attacks) charData.attacks.forEach(atk => renderAttackCard(atk));
        if (charData.abilities) charData.abilities.forEach(ability => renderAbilityCard(ability));

        const invContainer = document.getElementById('inventoryList');
        if (invContainer) {
            invContainer.innerHTML = '';
            if (charData.inventory) {
                charData.inventory.forEach(item => renderItem(item));
            }
        }

        // Recalcula todos os bônus ativos (Itens equipados + Habilidades ativas)
        updateAllBonuses(charData);

    } catch (error) {
        console.error(error);
        Swal.fire({
            icon: 'error',
            title: 'Erro!',
            text: 'Erro ao carregar a ficha: ' + error.message,
            background: '#212529',
            color: '#fff'
        });
    }
};

// Inicialização ao carregar a página
document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const token = localStorage.getItem('authToken');

    // Validação de segurança básica
    if (!token) { window.location.href = 'index.html'; return; }
    if (!id) { window.location.href = 'Dashboard.html'; return; }

    await window.loadCharacterData(id, token);

    // Evento para atualizar o valor base ao digitar manualmente
    document.addEventListener('input', (e) => {
        if (e.target.matches('input') && e.target.type !== 'checkbox' && e.target.type !== 'radio') {
            e.target.dataset.baseValue = e.target.value;
        }
    });

    // Lógica para atualizar visualmente as barras de progresso ao alterar valores
    function updateBar(currentInput, maxInput, barElement) {
        if (!barElement || !currentInput || !maxInput) return;
        const current = parseInt(currentInput.value) || 0;
        const max = parseInt(maxInput.value) || 0;
        if (max <= 0) { barElement.style.width = '0%'; return; }
        const percentage = Math.min(100, Math.max(0, (current / max) * 100));
        barElement.style.width = `${percentage}%`;
    }

    const statusPairs = [
        ['statusHealthCurrent', 'statusMaxHealth', 'barHealth'],
        ['statusSanityCurrent',  'statusMaxSanity',  'barSanity'],
        ['statusManaCurrent',    'statusMaxMana',    'barMana'],
        ['statusStaminaCurrent', 'statusMaxStamina', 'barStamina']
    ];

    statusPairs.forEach(([currentId, maxId, barId]) => {
        const current = document.getElementById(currentId);
        const max = document.getElementById(maxId);
        const bar = document.getElementById(barId);
        if (!current || !max || !bar) return;
        const update = () => updateBar(current, max, bar);
        current.addEventListener('input', update);
        max.addEventListener('input', update);
    });

    // Configuração do botão de Salvar Manual
    const performSave = async () => {
        const btnSave = document.getElementById('btnSave');
        const originalText = btnSave.innerText;
        const isManual = (btnSave.innerText === "SALVAR"); 
        
        if(isManual) { 
            btnSave.innerText = "Salvando..."; 
            btnSave.disabled = true; 
        } else {
            console.log("Auto-salvando...");
        }

        try { 
            await saveCharacterData(id, token, btnSave); 
            if(isManual) {
                Toast.fire({ icon: 'success', title: 'Ficha salva com sucesso!' });
            }
        } catch (e) { 
            console.error(e);
            if(isManual) {
                Toast.fire({ icon: 'error', title: 'Erro ao salvar!' });
            }
        } finally { 
            if(isManual) { 
                btnSave.innerText = originalText; 
                btnSave.disabled = false; 
            } 
        }
    };

    const btnSave = document.getElementById('btnSave');
    if(btnSave) btnSave.addEventListener('click', (e) => { e.preventDefault(); performSave(); });

    // Configuração do Auto-Save (Debounce de 1s ao digitar e Intervalo de 5min)
    const autoSave = debounce(() => performSave(), 1000);
    const autoSaveInputs = [
        'statusHealthCurrent', 'statusMaxHealth', 'statusManaCurrent', 'statusMaxMana',
        'statusStaminaCurrent', 'statusMaxStamina', 'statusSanityCurrent', 'statusMaxSanity',
        'statusDefense', 'defBase', 'defArmor', 'defOther', 'resPhysical', 'resMagical'
    ];
    autoSaveInputs.forEach(inputId => {
        const el = document.getElementById(inputId);
        if(el) el.addEventListener('input', autoSave);
    });
    setInterval(() => performSave(), 300000);

    // Bloco de Notas Temporário (Local Storage)
    const notepad = document.getElementById('tempNotepad');
    if (notepad) {
        const savedNote = localStorage.getItem('rpg_notepad_' + id);
        if (savedNote) notepad.value = savedNote;
        notepad.addEventListener('input', () => {
            localStorage.setItem('rpg_notepad_' + id, notepad.value);
        });
    }

    // Configuração de Modais (Ataque, Item, Habilidade)
    const btnOpenAttackModal = document.querySelector('#tabCombat button');
    if (btnOpenAttackModal) btnOpenAttackModal.addEventListener('click', (e) => {
        e.preventDefault();
        new bootstrap.Modal(document.getElementById('modalNewAttack')).show();
    });

    const btnSaveAttack = document.getElementById('btnSaveAttack');
    if (btnSaveAttack) btnSaveAttack.addEventListener('click', () => createAttack(id, token));

    // Lógica para avançar turno e reduzir cooldowns
    const btnNextTurn = document.getElementById('btnNextTurn');
    if (btnNextTurn) {
        btnNextTurn.addEventListener('click', async () => {
            const originalIcon = btnNextTurn.innerHTML;
            btnNextTurn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i>';
            btnNextTurn.disabled = true;
            try {
                const response = await fetch(`https://bloodcrown-api.onrender.com/abilities/next-turn/${id}`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) throw new Error('Erro ao passar turno.');
                
                await window.loadCharacterData(id, token);
                Toast.fire({ icon: 'info', title: 'Turno avançado' });

            } catch (error) { 
                console.error(error); 
                Swal.fire({ icon: 'error', title: 'Erro', text: 'Erro ao processar turno.', background:'#212529', color:'#fff' });
            } finally { 
                btnNextTurn.innerHTML = originalIcon; 
                btnNextTurn.disabled = false; 
            }
        });
    }

    // Lógica para Descanso Longo (Recuperação Total)
    const btnRest = document.getElementById('btnRest');
    if (btnRest) {
        btnRest.addEventListener('click', async (e) => {
            e.preventDefault();
            
            const result = await Swal.fire({
                title: 'Descanso Longo?',
                text: "Isso recuperará toda Vida, Mana, Sanidade, Estamina e resetará usos de habilidades.",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#7b2cbf', 
                cancelButtonColor: '#6c757d',
                confirmButtonText: 'Sim, descansar',
                cancelButtonText: 'Cancelar',
                background: '#212529',
                color: '#fff'
            });

            if (!result.isConfirmed) return;

            const originalHtml = btnRest.innerHTML;
            btnRest.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i>';
            btnRest.disabled = true;
            try {
                const response = await fetch(`https://bloodcrown-api.onrender.com/characters/${id}/rest`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) throw new Error('Erro ao realizar descanso.');
                
                await window.loadCharacterData(id, token);
                
                Swal.fire({
                    title: 'Renovado!',
                    text: 'Você está pronto para a aventura.',
                    icon: 'success',
                    background: '#212529',
                    color: '#fff',
                    timer: 2000,
                    showConfirmButton: false
                });

            } catch (error) { 
                console.error(error); 
                Swal.fire({ icon: 'error', title: 'Erro', text: error.message, background:'#212529', color:'#fff' });
            } finally { 
                btnRest.innerHTML = originalHtml; 
                btnRest.disabled = false; 
            }
        });
    }

    // Painel Flutuante de Efeitos Ativos (Buffs/Debuffs)
    const btnOpenPanel = document.getElementById('btnOpenPanel');
    const btnClosePanel = document.getElementById('btnClosePanel');
    const panel = document.getElementById('activeEffectsPanel');
    let isPanelMinimized = false;

    if (btnOpenPanel && btnClosePanel) {
        btnClosePanel.addEventListener('click', () => {
            isPanelMinimized = true;
            panel.style.display = 'none';
            btnOpenPanel.style.display = 'block';
        });
        btnOpenPanel.addEventListener('click', () => {
            isPanelMinimized = false;
            panel.style.display = 'block';
            btnOpenPanel.style.display = 'none';
        });
    }

    // Expõe a função de atualização de bônus para uso global
    window.updateAllBonusesState = function(charData) {
        updateAllBonuses(charData, isPanelMinimized, panel, btnOpenPanel);
    };

    // Botões de Item
    const btnOpenItemModal = document.getElementById('btnOpenItemModal');
    if (btnOpenItemModal) {
        btnOpenItemModal.addEventListener('click', (e) => {
            e.preventDefault();
            new bootstrap.Modal(document.getElementById('modalNewItem')).show();
        });
    }
    const btnSaveItem = document.getElementById('btnSaveItem');
    if (btnSaveItem) btnSaveItem.addEventListener('click', () => createItem(id, token));

    window.openAbilityModal = function(category) {
        const select = document.getElementById('abilCategory');
        if(select) select.value = category; 
        new bootstrap.Modal(document.getElementById('modalNewAbility')).show();
    }
    document.getElementById('btnSaveAbility').addEventListener('click', () => createAbility(id, token));
    
    setupRollEvents();
});

/**
 * Coleta todos os dados da ficha no DOM, constrói um objeto JSON complexo
 * e envia para a API via requisição PUT.
 * @param {string} id - ID do personagem.
 * @param {string} token - Token de autenticação.
 * @param {HTMLElement} btnSave - Botão de salvar (para controle de estado).
 */
async function saveCharacterData(id, token, btnSave) {
    try {
        const updatedData = {
            id: id,
            name: document.getElementById('charName').value,
            characterClass: document.getElementById('charClass').value,
            level: parseInt(document.getElementById('charLevel').value) || 1,
            
            money: document.getElementById('charMoney') ? document.getElementById('charMoney').value : "",
            biography: document.getElementById('charBio') ? document.getElementById('charBio').value : "",
            heroPoint: (document.getElementById('charHeroPoint') && document.getElementById('charHeroPoint').checked) ? 1 : 0,

            attributes: {
                forca: getRawValue('attrForca'),
                destreza: getRawValue('attrDestreza'),
                constituicao: getRawValue('attrConstituicao'),
                inteligencia: getRawValue('attrInteligencia'),
                sabedoria: getRawValue('attrSabedoria'),
                carisma: getRawValue('attrCarisma')
            },
            status: {
                maxHealth: getRawValue('statusMaxHealth'),
                currentHealth: getRawValue('statusHealthCurrent'),
                maxMana: getRawValue('statusMaxMana'),
                currentMana: getRawValue('statusManaCurrent'),
                maxSanity: getRawValue('statusMaxSanity'),
                currentSanity: getRawValue('statusSanityCurrent'),
                maxStamina: getRawValue('statusMaxStamina'),
                currentStamina: getRawValue('statusStaminaCurrent'),
                defense: getRawValue('statusDefense'),
                defenseBase: getRawValue('defBase'),
                armorBonus: getRawValue('defArmor'),
                otherBonus: getRawValue('defOther'),
                physicalRes: getRawValue('resPhysical'),
                magicalRes: getRawValue('resMagical')
            },
            expertise: {
                atletismo: getRawValue('skillAtletismo'),
                conhecimento: getRawValue('skillConhecimento'),
                consertar: getRawValue('skillConsertar'),
                diplomacia: getRawValue('skillDiplomacia'),
                domar: getRawValue('skillDomar'),
                empatia: getRawValue('skillEmpatia'),
                fortitude: getRawValue('skillFortitude'),
                furtividade: getRawValue('skillFurtividade'),
                magia: getRawValue('skillMagia'),
                iniciativa: getRawValue('skillIniciativa'),
                intimidar: getRawValue('skillIntimidar'),
                intuicao: getRawValue('skillIntuicao'),
                investigacao: getRawValue('skillInvestigacao'),
                labia: getRawValue('skillLabia'),
                ladinagem: getRawValue('skillLadinagem'),
                luta: getRawValue('skillLuta'),
                medicina: getRawValue('skillMedicina'),
                mente: getRawValue('skillMente'),
                percepcao: getRawValue('skillPercepcao'),
                pontaria: getRawValue('skillPontaria'),
                reflexos: getRawValue('skillReflexos'),
                seduzir: getRawValue('skillSeduzir'),
                sobrevivencia: getRawValue('skillSobrevivencia')
            }
        };

        const response = await fetch(`https://bloodcrown-api.onrender.com/characters/${id}`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData)
        });
        if (!response.ok) throw new Error('Erro ao salvar ficha.');
    } catch (error) { throw error; }
}

/**
 * Calcula e aplica os bônus de habilidades ativas e itens equipados.
 * Percorre todas as habilidades ativas e itens, soma os modificadores
 * e atualiza os inputs correspondentes na tela, destacando-os em verde.
 * @param {Object} charData - Dados completos do personagem.
 * @param {boolean} isMinimized - Estado do painel de efeitos.
 */
function updateAllBonuses(charData, isMinimized, panelEl, btnOpenEl) {
    const panel = panelEl || document.getElementById('activeEffectsPanel');
    const btnOpen = btnOpenEl || document.getElementById('btnOpenPanel');
    const badge = document.getElementById('badgeActiveCount');
    const list = document.getElementById('effectsList');
    
    // Lista de todos os campos que podem receber bônus
    const allPossibleTargets = [
        'defOther', 'defArmor', 'resPhysical', 'resMagical',
        'attrForca', 'attrDestreza', 'attrConstituicao', 'attrInteligencia', 'attrSabedoria', 'attrCarisma',
        'skillAtletismo', 'skillLuta', 'skillMagia', 'skillPercepcao', 'skillFurtividade', 'skillIniciativa',
        'skillConhecimento', 'skillConsertar', 'skillDiplomacia', 'skillDomar', 'skillEmpatia', 'skillFortitude',
        'skillIntimidar', 'skillIntuicao', 'skillInvestigacao', 'skillLabia', 'skillLadinagem', 'skillMedicina',
        'skillMente', 'skillPontaria', 'skillReflexos', 'skillSeduzir', 'skillSobrevivencia'
    ];
    // Reseta todos os inputs para seu valor base antes de recalcular
    allPossibleTargets.forEach(id => {
        const input = document.getElementById(id);
        if(input && input.dataset.baseValue !== undefined) {
            input.value = input.dataset.baseValue;
            input.style.color = '';
        }
    });

    const totalBuffs = {};
    let activeCount = 0;
    
    if(list) list.innerHTML = '';

    // Processa Habilidades Ativas
    if (charData.abilities) {
        charData.abilities.forEach(abil => {
            if (abil.isActive) {
                activeCount++;
                if (abil.effects) {
                    abil.effects.forEach(eff => {
                        if (!totalBuffs[eff.target]) totalBuffs[eff.target] = 0;
                        totalBuffs[eff.target] += eff.value;
                    });
                }
                
                // Adiciona item visual na lista do painel flutuante
                if (list) {
                    const item = document.createElement('div');
                    item.className = 'bg-black p-2 rounded border border-secondary position-relative';
                    let durationText = 'Cena';
                    if (abil.turnsRemaining !== null) durationText = `${abil.turnsRemaining} trns`;
                    
                    let buffText = '';
                    if (abil.effects) {
                        buffText = abil.effects.map(eff => {
                            let niceName = eff.target.replace('skill','').replace('attr','');
                            return `<div class="text-success small" style="font-size: 0.7rem;">+${eff.value} ${niceName}</div>`;
                        }).join('');
                    }
                    item.innerHTML = `
                        <div class="d-flex justify-content-between align-items-center mb-1">
                            <strong class="text-light small">${abil.name}</strong>
                            <span class="badge bg-warning text-dark" style="font-size: 0.6rem;">${durationText}</span>
                        </div>
                        ${buffText}
                    `;
                    list.appendChild(item);
                }
            }
        });
    }

    // Processa Itens Equipados
    if (charData.inventory) {
        charData.inventory.forEach(item => {
            if (item.isEquipped && item.targetAttribute !== 'none') {
                if (!item.targetAttribute.includes('REDUCE')) {
                    if (!totalBuffs[item.targetAttribute]) totalBuffs[item.targetAttribute] = 0;
                    totalBuffs[item.targetAttribute] += (item.effectValue || 0);
                }
            }
        });
    }

    // Gerencia a visibilidade do painel flutuante
    if (activeCount > 0) {
        if (isMinimized) {
            if(panel) panel.style.display = 'none';
            if(btnOpen) btnOpen.style.display = 'block';
        } else {
            if(panel) panel.style.display = 'block';
            if(btnOpen) btnOpen.style.display = 'none';
        }
        if(badge) badge.innerText = activeCount;
    } else {
        if(panel) panel.style.display = 'none';
        if(btnOpen) btnOpen.style.display = 'none';
    }

    // Aplica os buffs calculados aos inputs e muda a cor para verde
    for (const [targetId, val] of Object.entries(totalBuffs)) {
        const input = document.getElementById(targetId);
        if (input) {
            const base = parseInt(input.dataset.baseValue) || 0;
            input.value = base + val;
            input.style.color = '#00ff00';
        }
    }

    // Recalcula defesa final se a função estiver disponível
    if(window.calculateDefense) window.calculateDefense();
}