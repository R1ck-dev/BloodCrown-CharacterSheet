async function createItem(characterId, token) {
    const data = {
        name: document.getElementById('itemName').value,
        description: document.getElementById('itemDesc').value,
        targetAttribute: document.getElementById('itemTarget').value,
        effectValue: parseInt(document.getElementById('itemValue').value) || 0,
        isEquipped: false
    };

    try {
        const response = await fetch(`https://bloodcrown-api.onrender.com/items/${characterId}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (!response.ok) throw new Error('Erro ao criar item');

        const params = new URLSearchParams(window.location.search);
        if(window.loadCharacterData) window.loadCharacterData(params.get('id'), token);
        
        bootstrap.Modal.getInstance(document.getElementById('modalNewItem')).hide();
        document.getElementById('formItem').reset();

    } catch (e) { 
        Swal.fire({ icon: 'error', title: 'Erro', text: e.message, background: '#212529', color: '#fff', confirmButtonColor: '#7b2cbf' });
    }
}

async function toggleEquipItem(itemId, token) {
    try {
        await fetch(`https://bloodcrown-api.onrender.com/items/${itemId}/toggle`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const params = new URLSearchParams(window.location.search);
        if(window.loadCharacterData) window.loadCharacterData(params.get('id'), token);

    } catch (e) { console.error(e); }
}

async function deleteItem(itemId, token) {
    const result = await Swal.fire({
        title: 'Deletar Item?',
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
        await fetch(`https://bloodcrown-api.onrender.com/items/${itemId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const params = new URLSearchParams(window.location.search);
        if(window.loadCharacterData) window.loadCharacterData(params.get('id'), token);
    } catch (e) { 
        Swal.fire({ icon: 'error', title: 'Erro', text: "Erro ao deletar item.", background: '#212529', color: '#fff', confirmButtonColor: '#7b2cbf' });
    }
}

function renderItem(item) {
    const container = document.getElementById('inventoryList');
    const div = document.createElement('div');
    div.className = `p-2 rounded border position-relative ${item.isEquipped ? 'bg-dark border-info' : 'bg-black border-secondary'}`;
    
    let effectText = '';
    if (item.targetAttribute !== 'none' && item.effectValue) {
        let label = item.targetAttribute;
        if (label === 'defArmor') label = 'Armadura';
        if (label === 'REDUCE_MANA') label = 'Custo Mana';
        if (label === 'REDUCE_STAMINA') label = 'Custo Estamina';
        
        const signal = item.targetAttribute.includes('REDUCE') ? '-' : '+';
        effectText = `<span class="badge bg-secondary ms-2" style="font-size: 0.7rem;">${signal}${item.effectValue} ${label}</span>`;
    }

    div.innerHTML = `
        <div class="d-flex justify-content-between align-items-center">
            <div class="d-flex align-items-center">
                <input type="checkbox" class="form-check-input me-2 bg-black border-secondary" 
                    ${item.isEquipped ? 'checked' : ''} onchange="toggleEquipItem('${item.id}', localStorage.getItem('authToken'))">
                <div>
                    <strong class="text-light small">${item.name}</strong>
                    ${effectText}
                    <div class="text-secondary small" style="font-size: 0.75rem;">${item.description}</div>
                </div>
            </div>
            <button type="button" class="btn btn-sm text-secondary" onclick="deleteItem('${item.id}', localStorage.getItem('authToken'))"><i class="fa-solid fa-trash"></i></button>
        </div>
    `;
    container.appendChild(div);
}