/*
    Gerencia a lógica de cálculo de Defesa (Armor Class/AC).
    Monitora alterações nos atributos e equipamentos para atualizar o valor total em tempo real.
*/

/**
 * Calcula o valor total da defesa com base nos inputs do usuário.
 * Fórmula: Base + Destreza + Armadura + Outros Bônus.
 * Atualiza o campo de exibição final e o display de destreza na fórmula.
 */
function calculateDefense() {
    // Obtém o valor do modificador de Destreza (ou 0 se vazio)
    const dex = parseInt(document.getElementById('attrDestreza').value) || 0;

    // Obtém os valores dos componentes da defesa
    const base = parseInt(document.getElementById('defBase').value) || 0;
    const armor = parseInt(document.getElementById('defArmor').value) || 0;
    const other = parseInt(document.getElementById('defOther').value) || 0;

    // Atualiza o texto visual que mostra quanto de destreza está sendo somado
    const dexDisplay = document.getElementById('defDexDisplay');
    if (dexDisplay) dexDisplay.innerText = dex;

    // Realiza o somatório total
    const total = base + dex + armor + other;

    // Define o valor calculado no input principal de defesa
    const totalInput = document.getElementById('statusDefense');
    if (totalInput) totalInput.value = total;
}

/**
 * Configura os ouvintes de eventos (Event Listeners) para os campos de defesa.
 * Garante que qualquer alteração nos componentes dispare um recálculo imediato.
 */
function setupDefenseEvents() {
    // Lista de IDs dos inputs que influenciam a defesa
    const inputsToWatch = ['defBase', 'defArmor', 'defOther', 'attrDestreza'];

    // Adiciona o evento 'input' a cada campo monitorado
    inputsToWatch.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('input', calculateDefense);
        }
    })
}