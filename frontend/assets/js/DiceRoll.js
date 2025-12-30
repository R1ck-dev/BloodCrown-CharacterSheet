/* assets/js/DiceRoll.js - Corrigido Travamento de Animação */

const skillMap = {
    'skillAtletismo': 'attrForca', 'skillLuta': 'attrForca',
    'skillFurtividade': 'attrDestreza', 'skillIniciativa': 'attrDestreza', 'skillLadinagem': 'attrDestreza', 'skillPontaria': 'attrDestreza', 'skillReflexos': 'attrDestreza',
    'skillConhecimento': 'attrInteligencia', 'skillConsertar': 'attrInteligencia', 'skillInvestigacao': 'attrInteligencia', 'skillMedicina': 'attrInteligencia', 'skillMente': 'attrInteligencia', 'skillSobrevivencia': 'attrInteligencia',
    'skillDiplomacia': 'attrCarisma', 'skillDomar': 'attrCarisma', 'skillEmpatia': 'attrCarisma', 'skillIntimidar': 'attrCarisma', 'skillLabia': 'attrCarisma', 'skillSeduzir': 'attrCarisma',
    'skillFortitude': 'attrConstituicao',
    'skillIntuicao': 'attrSabedoria', 'skillMagia': 'attrSabedoria', 'skillPercepcao': 'attrSabedoria'
}

let toastTimer = null;
let animationInterval = null;

function rollSystem(sourceName, attrId, skillInputId = null) {
    const attrElement = document.getElementById(attrId);
    let diceCount = parseInt(attrElement.value) || 0;
    if (diceCount < 1) diceCount = 1;

    let bonus = 0;
    if (skillInputId) {
        const skillElement = document.getElementById(skillInputId);
        bonus = parseInt(skillElement.value) || 0; 
    }

    let finalRolls = [];
    for (let i = 0; i < diceCount; i++) {
        finalRolls.push(Math.ceil(Math.random() * 20));
    }
    const bestDice = Math.max(...finalRolls);
    const finalResult = bestDice + bonus;

    animateAndShow(sourceName, finalRolls, bestDice, bonus, finalResult, 20, false);
}

function rollDamage(damageString, sourceName) {
    const cleanStr = damageString.toLowerCase().replace(/\s/g, '');
    const regexReal = /([+-]?)(\d+)d(\d+)|([+-]?)(\d+)/g;
    
    if (!cleanStr.match(/[\d\w]/)) {
        Swal.fire({ icon: 'warning', text: "Fórmula de dano vazia.", background: '#212529', color: '#fff', confirmButtonColor: '#8a1c1c' });
        return;
    }

    let match;
    let total = 0;
    let allRolls = [];
    let maxFaceFound = 20;

    while ((match = regexReal.exec(cleanStr)) !== null) {
        if (match[2] && match[3]) { 
            const sign = match[1] === '-' ? -1 : 1;
            const count = parseInt(match[2]);
            const faces = parseInt(match[3]);
            if(faces > maxFaceFound) maxFaceFound = faces;

            for (let i = 0; i < count; i++) {
                const result = Math.ceil(Math.random() * faces);
                allRolls.push(result);
                total += (result * sign);
            }
        }
        else if (match[5]) { 
            const sign = match[4] === '-' ? -1 : 1;
            const val = parseInt(match[5]);
            total += (val * sign);
        }
    }

    animateAndShow(sourceName, allRolls, null, 0, total, maxFaceFound, true);
}

function animateAndShow(title, realRollsArray, realBest, realBonus, realTotal, maxFaceSize, isDamage) {
    const toast = document.getElementById('diceToast');
    const titleEl = document.getElementById('rollTitle');
    const rollsEl = document.getElementById('diceRolled');
    const resultEl = document.getElementById('finalResult');
    
    const bestLabel = document.getElementById('bestDice');
    const modLabel = document.getElementById('modifierValue');
    const extraLabelContainer = document.querySelector('#diceToast .dice-info div:nth-child(2)'); 

    if (toastTimer) clearTimeout(toastTimer);
    if (animationInterval) clearInterval(animationInterval);
    
    toast.classList.add('show');
    titleEl.innerText = title;
    resultEl.style.color = "#ccc"; 
    resultEl.style.transform = "scale(1)";

    if(isDamage) {
        if(bestLabel && bestLabel.parentElement) bestLabel.parentElement.innerHTML = '<small class="text-secondary" style="font-size: 0.7rem;">DADOS</small><div id="bestDice">-</div>';
        if(extraLabelContainer) extraLabelContainer.innerHTML = '<small class="text-secondary" style="font-size: 0.7rem;">TIPO</small><div class="text-light">Dano</div>';
    } else {
        if(bestLabel && bestLabel.parentElement) bestLabel.parentElement.innerHTML = '<small class="text-secondary" style="font-size: 0.7rem;">MELHOR</small><div id="bestDice" class="fs-4 fw-bold text-info"></div>';
        if(extraLabelContainer) extraLabelContainer.innerHTML = '<small class="text-secondary" style="font-size: 0.7rem;">BÔNUS</small><div id="modifierValue" class="fs-4 fw-bold text-success"></div>';
    }

    const currentBestEl = document.getElementById('bestDice');
    const currentModEl = document.getElementById('modifierValue');

    if (!isDamage && currentModEl) {
        currentModEl.innerText = realBonus >= 0 ? `+${realBonus}` : realBonus;
    }

    let counter = 0;
    const duration = 1500; 
    const intervalTime = 100; 

    animationInterval = setInterval(() => {
        const fakeRolls = realRollsArray.map(() => Math.ceil(Math.random() * maxFaceSize));
        const fakeBest = Math.max(...fakeRolls);
        
        rollsEl.innerText = `[ ${fakeRolls.join(', ')} ]`;
        
        if (isDamage) {
            const fakeTotal = fakeRolls.reduce((a, b) => a + b, 0); 
            resultEl.innerText = fakeTotal; 
            if(currentBestEl) currentBestEl.innerText = "-";
        } else {
            resultEl.innerText = fakeBest + realBonus;
            if(currentBestEl) currentBestEl.innerText = fakeBest;
        }

        counter += intervalTime;
        if (counter >= duration) {
            finishAnimation(realRollsArray, realBest, realTotal, isDamage, currentBestEl, extraLabelContainer);
        }
    }, intervalTime);
}

function finishAnimation(realRolls, realBest, realTotal, isDamage, bestEl, extraContainer) {
    clearInterval(animationInterval); 

    document.getElementById('diceRolled').innerText = `[ ${realRolls.join(', ')} ]`;
    const resEl = document.getElementById('finalResult');
    
    resEl.innerText = realTotal;

    if (isDamage) {
        if(bestEl) bestEl.innerText = realRolls.length + "d"; // Mostra qtd de dados
        if(extraContainer) extraContainer.innerHTML = `<small class="text-secondary" style="font-size: 0.7rem;">TOTAL</small><div class="text-warning fw-bold">${realTotal}</div>`;
    } else {
        if(bestEl) bestEl.innerText = realBest;
    }

    resEl.style.transition = "all 0.2s ease";
    resEl.style.color = "#d4af37"; 
    resEl.style.transform = "scale(1.3)";
    setTimeout(() => { resEl.style.transform = "scale(1)"; }, 200);

    toastTimer = setTimeout(() => {
        document.getElementById('diceToast').classList.remove('show');
    }, 8000);
}

function setupRollEvents() {
    for (const [skillId, attrId] of Object.entries(skillMap)) {
        const skillInput = document.getElementById(skillId);
        if (!skillInput) continue;
        const row = skillInput.closest('tr');
        if (row) {
            const nameCell = row.cells[0];
            nameCell.classList.add('clickable-roll');
            nameCell.title = "Clique para rolar";
            nameCell.addEventListener('click', () => {
                const skillName = nameCell.innerText.split('(')[0].trim();
                rollSystem(skillName, attrId, skillId);
            });
        }
    }
    const attributes = ['attrForca', 'attrDestreza', 'attrConstituicao', 'attrInteligencia', 'attrSabedoria', 'attrCarisma'];
    attributes.forEach(attrId => {
        const input = document.getElementById(attrId);
        if(!input) return;
        const box = input.closest('.attr-circle');
        if(box) {
            box.style.cursor = "pointer";
            box.title = "Clique para rolar";
            box.addEventListener('click', (e) => {
                if (e.target.tagName === 'INPUT') return;
                const label = box.querySelector('label').innerText;
                rollSystem(`Teste de ${label}`, attrId, null);
            });
        }
    });

    const closeToastBtn = document.getElementById('closeToast');
    if(closeToastBtn) {
        closeToastBtn.addEventListener('click', () => {
            const toast = document.getElementById('diceToast');
            toast.classList.remove('show');
            if(toastTimer) clearTimeout(toastTimer);
            if(animationInterval) clearInterval(animationInterval);
        });
    }
}