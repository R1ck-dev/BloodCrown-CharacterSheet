window.loadCharacterData = async function(id, token) {
    try {
        console.log("Atualizando ficha...", id);
        const charData = await getCharacterById(id, token);

        document.getElementById('charName').value = charData.name;
        document.getElementById('charClass').value = charData.characterClass;
        document.getElementById('charLevel').value = charData.level;

        if(charData.attributes) {
            document.getElementById('attrForca').value = charData.attributes.forca;
            document.getElementById('attrDestreza').value = charData.attributes.destreza;
            document.getElementById('attrConstituicao').value = charData.attributes.constituicao;
            document.getElementById('attrInteligencia').value = charData.attributes.inteligencia;
            document.getElementById('attrSabedoria').value = charData.attributes.sabedoria;
            document.getElementById('attrCarisma').value = charData.attributes.carisma;
        }

        if(charData.status) {
            document.getElementById('statusDefense').value = charData.status.defense ?? 0;
            document.getElementById('defBase').value = charData.status.defenseBase ?? 10;
            document.getElementById('defArmor').value = charData.status.armorBonus ?? 0;
            document.getElementById('defOther').value = charData.status.otherBonus ?? 0;

            const updateBarValue = (currentId, maxId, currentVal, maxVal) => {
                const cEl = document.getElementById(currentId);
                const mEl = document.getElementById(maxId);
                if(cEl) cEl.value = currentVal ?? maxVal ?? 0;
                if(mEl) mEl.value = maxVal ?? 0;
                if(cEl) cEl.dispatchEvent(new Event('input'));
            };

            updateBarValue('statusHealthCurrent', 'statusMaxHealth', charData.status.currentHealth, charData.status.maxHealth);
            updateBarValue('statusManaCurrent', 'statusMaxMana', charData.status.currentMana, charData.status.maxMana);
            updateBarValue('statusSanityCurrent', 'statusMaxSanity', charData.status.currentSanity, charData.status.maxSanity);
            updateBarValue('statusStaminaCurrent', 'statusMaxStamina', charData.status.currentStamina, charData.status.maxStamina);

            if(window.setupDefenseEvents) setupDefenseEvents();
            if(window.calculateDefense) calculateDefense();
        }

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
                const el = document.getElementById(id);
                if(el) el.value = value || 0;
            }
        }

        
        document.querySelectorAll('.attacks-grid, .ability-card').forEach(e => e.remove());

        if (charData.attacks && charData.attacks.length > 0) {
            charData.attacks.forEach(atk => renderAttackCard(atk));
        }

        if (charData.abilities && charData.abilities.length > 0) {
            charData.abilities.forEach(ability => {
                renderAbilityCard(ability);
            });
            updateActiveEffects(charData.abilities);
        }

    } catch (error) {
        console.error(error);
        alert("Erro ao carregar a ficha: " + error.message);
    }
};

document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const token = localStorage.getItem('authToken');

    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    if (!id) {
        alert("ID da ficha não encontrado.");
        window.location.href = 'Dashboard.html';
        return;
    }

    await window.loadCharacterData(id, token);

    function updateBar(currentInput, maxInput, barElement) {
        if (!barElement || !currentInput || !maxInput) return;
        const current = parseInt(currentInput.value) || 0;
        const max = parseInt(maxInput.value) || 0;
        if (max <= 0) {
            barElement.style.width = '0%';
            return;
        }
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

    const btnSave = document.getElementById('btnSave');
    btnSave.addEventListener('click', async (e) => {
        e.preventDefault();
        saveCharacterData(id, token, btnSave); 
    });

    const btnOpenAttackModal = document.querySelector('#tabCombat button');
    if (btnOpenAttackModal) {
        btnOpenAttackModal.addEventListener('click', (e) => {
            e.preventDefault();
            const modal = new bootstrap.Modal(document.getElementById('modalNewAttack'));
            modal.show();
        });
    }

    const btnSaveAttack = document.getElementById('btnSaveAttack');
    if (btnSaveAttack) {
        btnSaveAttack.addEventListener('click', () => createAttack(id, token));
    }

    const btnNextTurn = document.getElementById('btnNextTurn');
    if (btnNextTurn) {
        btnNextTurn.addEventListener('click', async () => {
            const originalIcon = btnNextTurn.innerHTML;
            btnNextTurn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Processando...';
            btnNextTurn.disabled = true;

            try {
                const response = await fetch(`http://localhost:8080/abilities/next-turn/${id}`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!response.ok) throw new Error('Erro ao passar turno.');

                await window.loadCharacterData(id, token);

            } catch (error) {
                console.error(error);
                alert("Erro ao processar turno.");
            } finally {
                btnNextTurn.innerHTML = originalIcon;
                btnNextTurn.disabled = false;
            }
        });
    }

    window.openAbilityModal = function(category) {
        const select = document.getElementById('abilCategory');
        if(select) select.value = category; 
        const modal = new bootstrap.Modal(document.getElementById('modalNewAbility'));
        modal.show();
    }

    document.getElementById('btnSaveAbility').addEventListener('click', () => {
        createAbility(id, token);
    });

    setupRollEvents();
});

async function saveCharacterData(id, token, btnSave) {
    const originalText = btnSave.innerText;
    btnSave.innerText = "Salvando...";
    btnSave.disabled = true;

    try {
        const updatedData = {
            id: id,
            name: document.getElementById('charName').value,
            characterClass: document.getElementById('charClass').value,
            level: parseInt(document.getElementById('charLevel').value) || 1,
            attributes: {
                forca: parseInt(document.getElementById('attrForca').value) || 0,
                destreza: parseInt(document.getElementById('attrDestreza').value) || 0,
                constituicao: parseInt(document.getElementById('attrConstituicao').value) || 0,
                inteligencia: parseInt(document.getElementById('attrInteligencia').value) || 0,
                sabedoria: parseInt(document.getElementById('attrSabedoria').value) || 0,
                carisma: parseInt(document.getElementById('attrCarisma').value) || 0
            },
            status: {
                maxHealth: parseInt(document.getElementById('statusMaxHealth').value) || 0,
                currentHealth: parseInt(document.getElementById('statusHealthCurrent').value) || 0,
                maxMana: parseInt(document.getElementById('statusMaxMana').value) || 0,
                currentMana: parseInt(document.getElementById('statusManaCurrent').value) || 0,
                maxSanity: parseInt(document.getElementById('statusMaxSanity').value) || 0,
                currentSanity: parseInt(document.getElementById('statusSanityCurrent').value) || 0,
                maxStamina: parseInt(document.getElementById('statusMaxStamina').value) || 0,
                currentStamina: parseInt(document.getElementById('statusStaminaCurrent').value) || 0,
                defense: parseInt(document.getElementById('statusDefense').value) || 0,
                defenseBase: parseInt(document.getElementById('defBase').value) || 10,
                armorBonus: parseInt(document.getElementById('defArmor').value) || 0,
                otherBonus: parseInt(document.getElementById('defOther').value) || 0
            },
            expertise: {
                atletismo: parseInt(document.getElementById('skillAtletismo').value) || 0,
                conhecimento: parseInt(document.getElementById('skillConhecimento').value) || 0,
                consertar: parseInt(document.getElementById('skillConsertar').value) || 0,
                diplomacia: parseInt(document.getElementById('skillDiplomacia').value) || 0,
                domar: parseInt(document.getElementById('skillDomar').value) || 0,
                empatia: parseInt(document.getElementById('skillEmpatia').value) || 0,
                fortitude: parseInt(document.getElementById('skillFortitude').value) || 0,
                furtividade: parseInt(document.getElementById('skillFurtividade').value) || 0,
                magia: parseInt(document.getElementById('skillMagia').value) || 0,
                iniciativa: parseInt(document.getElementById('skillIniciativa').value) || 0,
                intimidar: parseInt(document.getElementById('skillIntimidar').value) || 0,
                intuicao: parseInt(document.getElementById('skillIntuicao').value) || 0,
                investigacao: parseInt(document.getElementById('skillInvestigacao').value) || 0,
                labia: parseInt(document.getElementById('skillLabia').value) || 0,
                ladinagem: parseInt(document.getElementById('skillLadinagem').value) || 0,
                luta: parseInt(document.getElementById('skillLuta').value) || 0,
                medicina: parseInt(document.getElementById('skillMedicina').value) || 0,
                mente: parseInt(document.getElementById('skillMente').value) || 0,
                percepcao: parseInt(document.getElementById('skillPercepcao').value) || 0,
                pontaria: parseInt(document.getElementById('skillPontaria').value) || 0,
                reflexos: parseInt(document.getElementById('skillReflexos').value) || 0,
                seduzir: parseInt(document.getElementById('skillSeduzir').value) || 0,
                sobrevivencia: parseInt(document.getElementById('skillSobrevivencia').value) || 0
            }
        };

        const response = await fetch(`http://localhost:8080/characters/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedData)
        });

        if (!response.ok) throw new Error('Erro ao salvar ficha.');
        alert("Ficha salva com sucesso!");

    } catch (error) {
        console.error(error);
        alert("Erro ao salvar: " + error.message);
    } finally {
        btnSave.innerText = originalText;
        btnSave.disabled = false;
    }
}


function updateActiveEffects(abilities) {
    const panel = document.getElementById('activeEffectsPanel');
    const list = document.getElementById('effectsList');
    list.innerHTML = ''; 

    let activeCount = 0;
    
    let bonusDefense = 0;
    let bonusArmor = 0;

    abilities.forEach(abil => {
        if (abil.isActive) {
            activeCount++;

            if (abil.targetAttribute === 'defense') bonusDefense += (abil.effectValue || 0);
            if (abil.targetAttribute === 'armor') bonusArmor += (abil.effectValue || 0);
            
            const item = document.createElement('div');
            item.className = 'bg-black p-2 rounded border border-secondary position-relative';
            
            let durationText = 'Infinito';
            if (abil.turnsRemaining !== null) {
                durationText = `${abil.turnsRemaining} turnos`;
            }

            let buffText = '';
            if (abil.targetAttribute !== 'none' && abil.effectValue) {
                buffText = `<div class="text-success small" style="font-size: 0.7rem;">+${abil.effectValue} ${abil.targetAttribute}</div>`;
            }

            item.innerHTML = `
                <div class="d-flex justify-content-between align-items-center">
                    <strong class="text-light small">${abil.name}</strong>
                    <span class="badge bg-warning text-dark" style="font-size: 0.6rem;">${durationText}</span>
                </div>
                ${buffText}
            `;
            list.appendChild(item);
        }
    });

    panel.style.display = activeCount > 0 ? 'block' : 'none';
    
    const inputOther = document.getElementById('defOther');
    
    if (!inputOther.dataset.manualValue) {
        inputOther.dataset.manualValue = inputOther.value || 0;
    }

    const manualVal = parseInt(inputOther.dataset.manualValue) || 0;
    const finalVal = manualVal + bonusDefense;
    
    inputOther.value = finalVal;
    if(bonusDefense > 0) inputOther.style.color = '#00ff00'; 
    else inputOther.style.color = '';

    if(window.calculateDefense) window.calculateDefense();
}