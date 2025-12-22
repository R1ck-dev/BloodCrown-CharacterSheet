function calculateDefense() {
    const dex = parseInt(document.getElementById('attrDestreza').value) || 0;

    const base = parseInt(document.getElementById('defBase').value) || 0;
    const armor = parseInt(document.getElementById('defArmor').value) || 0;
    const other = parseInt(document.getElementById('defOther').value) || 0;

    const dexDisplay = document.getElementById('defDexDisplay');
    if (dexDisplay) dexDisplay.innerText = dex;

    const total = base + dex + armor + other;

    const totalInput = document.getElementById('statusDefense');
    if (totalInput) totalInput.value = total;
}

function setupDefenseEvents() {
    const inputsToWatch = ['defBase', 'defArmor', 'defOther', 'attrDestreza'];

    inputsToWatch.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('input', calculateDefense);
        }
    })
}