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
            document.getElementById('statusMaxHealth').value = charData.status.maxHealth;
            document.getElementById('statusMaxMana').value = charData.status.maxMana;
            document.getElementById('statusMaxSanity').value = charData.status.maxSanity;
            document.getElementById('statusMaxStamina').value = charData.status.maxStamina;
            document.getElementById('statusDefense').value = charData.status.defense;
        }

        if(charData.expertise) {
            document.getElementById('skillAtletismo').value = charData.expertise.atletismo;
            document.getElementById('skillLuta').value = charData.expertise.luta;
            document.getElementById('skillPercepcao').value = charData.expertise.percepcao;
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
                    maxMana: parseInt(document.getElementById('statusMaxMana').value) || 0,
                    maxSanity: parseInt(document.getElementById('statusMaxSanity').value) || 0,
                    maxStamina: parseInt(document.getElementById('statusMaxStamina').value) || 0,
                    defense: parseInt(document.getElementById('statusDefense').value) || 0
                },

                expertise: {
                    atletismo: parseInt(document.getElementById('skillAtletismo').value) || 0,
                    luta: parseInt(document.getElementById('skillLuta').value) || 0,
                    percepcao: parseInt(document.getElementById('skillPercepcao').value) || 0
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

            alert("Ficha salva com sucesso! 💾");

        } catch (error) {
            console.error(error);
            alert("Erro ao salvar: " + error.message);
        } finally {
            btnSave.innerText = originalText;
            btnSave.disabled = false;
        }
    });
});