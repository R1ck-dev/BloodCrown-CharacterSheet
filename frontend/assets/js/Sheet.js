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

    try {
        console.log("Buscando ficha...", id);
        const charData = await getCharacterById(id, token);

        console.log("Dados recebidos:", charData);

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

            const statusHealthCurrent = document.getElementById('statusHealthCurrent');
            const statusMaxHealth = document.getElementById('statusMaxHealth');
            if (statusHealthCurrent) statusHealthCurrent.value = (charData.status.currentHealth ?? charData.status.maxHealth ?? 0);
            if (statusMaxHealth) statusMaxHealth.value = (charData.status.maxHealth ?? 0);

            const statusManaCurrent = document.getElementById('statusManaCurrent');
            const statusMaxMana = document.getElementById('statusMaxMana');
            if (statusManaCurrent) statusManaCurrent.value = (charData.status.currentMana ?? charData.status.maxMana ?? 0);
            if (statusMaxMana) statusMaxMana.value = (charData.status.maxMana ?? 0);

            const statusSanityCurrent = document.getElementById('statusSanityCurrent');
            const statusMaxSanity = document.getElementById('statusMaxSanity');
            if (statusSanityCurrent) statusSanityCurrent.value = (charData.status.currentSanity ?? charData.status.maxSanity ?? 0);
            if (statusMaxSanity) statusMaxSanity.value = (charData.status.maxSanity ?? 0);

            const statusStaminaCurrent = document.getElementById('statusStaminaCurrent');
            const statusMaxStamina = document.getElementById('statusMaxStamina');
            if (statusStaminaCurrent) statusStaminaCurrent.value = (charData.status.currentStamina ?? charData.status.maxStamina ?? 0);
            if (statusMaxStamina) statusMaxStamina.value = (charData.status.maxStamina ?? 0);

            setupDefenseEvents();
            calculateDefense();
        }

        if(charData.expertise) {
            document.getElementById('skillAtletismo').value = charData.expertise.atletismo;
            document.getElementById('skillConhecimento').value = charData.expertise.conhecimento;
            document.getElementById('skillConsertar').value = charData.expertise.consertar;
            document.getElementById('skillDiplomacia').value = charData.expertise.diplomacia;
            document.getElementById('skillDomar').value = charData.expertise.domar;
            document.getElementById('skillEmpatia').value = charData.expertise.empatia;
            document.getElementById('skillFortitude').value = charData.expertise.fortitude;
            document.getElementById('skillFurtividade').value = charData.expertise.furtividade;
            document.getElementById('skillMagia').value = charData.expertise.magia;
            document.getElementById('skillIniciativa').value = charData.expertise.iniciativa;
            document.getElementById('skillIntimidar').value = charData.expertise.intimidar;
            document.getElementById('skillIntuicao').value = charData.expertise.intuicao;
            document.getElementById('skillInvestigacao').value = charData.expertise.investigacao;
            document.getElementById('skillLabia').value = charData.expertise.labia;
            document.getElementById('skillLadinagem').value = charData.expertise.ladinagem;
            document.getElementById('skillLuta').value = charData.expertise.luta;
            document.getElementById('skillMedicina').value = charData.expertise.medicina;
            document.getElementById('skillMente').value = charData.expertise.mente;
            document.getElementById('skillPercepcao').value = charData.expertise.percepcao;
            document.getElementById('skillPontaria').value = charData.expertise.pontaria;
            document.getElementById('skillReflexos').value = charData.expertise.reflexos;
            document.getElementById('skillSeduzir').value = charData.expertise.seduzir;
            document.getElementById('skillSobrevivencia').value = charData.expertise.sobrevivencia;

            if (charData.attacks && charData.attacks.length > 0) {
                charData.attacks.forEach(atk => renderAttackCard(atk));
            }
        }

    } catch (error) {
        console.error(error);
        alert("Erro ao carregar a ficha: " + error.message);
        window.location.href = 'Dashboard.html';
    }

    const btnSave = document.getElementById('btnSave');
    
    btnSave.addEventListener('click', async (e) => {
        e.preventDefault(); // Evita recarregar a página se estiver num form
        
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
    });

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

    (function bindStatusBars() {
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

        // Inicializa a barra
            update();
        });
    })();

    const btnOpenAttackModal = document.querySelector('#tabCombat button');

    if (btnOpenAttackModal) {
        btnOpenAttackModal.addEventListener('click', (e) => {
            e.preventDefault();
            const modalEl = document.getElementById('modalNewAttack');
            const modal = new bootstrap.Modal(modalEl);
            modal.show();
        });
    }

    const btnSaveAttack = document.getElementById('btnSaveAttack');

    if (btnSaveAttack) {
        btnSaveAttack.addEventListener('click', () => {
            createAttack(id, token);
        });
    }

    setupRollEvents();

}); //Fim do DOM

