/*
    Sistema de Rolagem de Dados.
    Gerencia cálculos de testes de perícia (d20), rolagens de dano (XdY)
    e a animação visual dos resultados na interface.
*/

// Mapeamento que associa cada ID de input de perícia ao seu atributo base correspondente.
const skillMap = {
    'skillAtletismo': 'attrForca', 'skillLuta': 'attrForca',
    'skillFurtividade': 'attrDestreza', 'skillIniciativa': 'attrDestreza', 'skillLadinagem': 'attrDestreza', 'skillPontaria': 'attrDestreza', 'skillReflexos': 'attrDestreza',
    'skillConhecimento': 'attrInteligencia', 'skillConsertar': 'attrInteligencia', 'skillInvestigacao': 'attrInteligencia', 'skillMedicina': 'attrInteligencia', 'skillMente': 'attrInteligencia', 'skillSobrevivencia': 'attrInteligencia',
    'skillDiplomacia': 'attrCarisma', 'skillDomar': 'attrCarisma', 'skillEmpatia': 'attrCarisma', 'skillIntimidar': 'attrCarisma', 'skillLabia': 'attrCarisma', 'skillSeduzir': 'attrCarisma',
    'skillFortitude': 'attrConstituicao',
    'skillIntuicao': 'attrSabedoria', 'skillMagia': 'attrSabedoria', 'skillPercepcao': 'attrSabedoria'
}

// Variáveis de controle para o temporizador e intervalo da animação
let toastTimer = null;
let animationInterval = null;

/**
 * Executa um teste de atributo ou perícia (Sistema d20).
 * Calcula o resultado baseando-se no valor do atributo e, opcionalmente, no bônus da perícia.
 * @param {string} sourceName - Nome da ação (ex: "Teste de Força").
 * @param {string} attrId - ID do elemento HTML do atributo base.
 * @param {string|null} skillInputId - ID do input da perícia (opcional).
 */
function rollSystem(sourceName, attrId, skillInputId = null) {
    const attrElement = document.getElementById(attrId);
    // Determina a quantidade de dados a rolar (baseado no valor do atributo)
    let diceCount = parseInt(attrElement.value) || 0;
    if (diceCount < 1) diceCount = 1;

    let bonus = 0;
    // Se for um teste de perícia, adiciona o bônus específico
    if (skillInputId) {
        const skillElement = document.getElementById(skillInputId);
        bonus = parseInt(skillElement.value) || 0; 
    }

    // Realiza as rolagens de d20
    let finalRolls = [];
    for (let i = 0; i < diceCount; i++) {
        finalRolls.push(Math.ceil(Math.random() * 20));
    }
    // Seleciona o melhor dado e soma o bônus
    const bestDice = Math.max(...finalRolls);
    const finalResult = bestDice + bonus;

    // Inicia a animação visual
    animateAndShow(sourceName, finalRolls, bestDice, bonus, finalResult, 20, false);
}

/**
 * Interpreta uma string de fórmula de dano (ex: "2d6+3") e executa a rolagem.
 * Suporta múltiplos tipos de dados e modificadores fixos.
 * @param {string} damageString - A fórmula de dano.
 * @param {string} sourceName - Nome da fonte do dano.
 */
function rollDamage(damageString, sourceName) {
    // Limpa a string para processamento
    const cleanStr = damageString.toLowerCase().replace(/\s/g, '');
    // Regex para identificar padrões de dados (XdY) e modificadores (+Z)
    const regexReal = /([+-]?)(\d+)d(\d+)|([+-]?)(\d+)/g;
    
    if (!cleanStr.match(/[\d\w]/)) {
        Swal.fire({ icon: 'warning', text: "Fórmula de dano vazia.", background: '#212529', color: '#fff', confirmButtonColor: '#8a1c1c' });
        return;
    }

    let match;
    let total = 0;
    let allRolls = [];
    let maxFaceFound = 20;

    // Itera sobre todas as correspondências da regex na string
    while ((match = regexReal.exec(cleanStr)) !== null) {
        if (match[2] && match[3]) { // Caso seja um dado (ex: 2d6)
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
        else if (match[5]) { // Caso seja um modificador fixo (ex: +3)
            const sign = match[4] === '-' ? -1 : 1;
            const val = parseInt(match[5]);
            total += (val * sign);
        }
    }

    // Inicia a animação em modo de dano
    animateAndShow(sourceName, allRolls, null, 0, total, maxFaceFound, true);
}

/**
 * Gerencia a animação dos números girando na notificação (Toast).
 * Simula o efeito de rolagem antes de mostrar o resultado real.
 * @param {string} title - Título da rolagem.
 * @param {Array} realRollsArray - Array com os resultados reais dos dados.
 * @param {number} realBest - O maior valor tirado (para testes de atributo).
 * @param {number} realBonus - O bônus aplicado.
 * @param {number} realTotal - O resultado final calculado.
 * @param {number} maxFaceSize - O tamanho do maior dado (para a animação aleatória).
 * @param {boolean} isDamage - Indica se é uma rolagem de dano (muda o layout).
 */
function animateAndShow(title, realRollsArray, realBest, realBonus, realTotal, maxFaceSize, isDamage) {
    const toast = document.getElementById('diceToast');
    const titleEl = document.getElementById('rollTitle');
    const rollsEl = document.getElementById('diceRolled');
    const resultEl = document.getElementById('finalResult');
    
    const bestLabel = document.getElementById('bestDice');
    const modLabel = document.getElementById('modifierValue');
    const extraLabelContainer = document.querySelector('#diceToast .dice-info div:nth-child(2)'); 

    // Limpa timers anteriores para evitar sobreposição
    if (toastTimer) clearTimeout(toastTimer);
    if (animationInterval) clearInterval(animationInterval);
    
    // Exibe o Toast
    toast.classList.add('show');
    titleEl.innerText = title;
    resultEl.style.color = "#ccc"; 
    resultEl.style.transform = "scale(1)";

    // Ajusta o layout do Toast dependendo do tipo de rolagem (Dano vs Teste)
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
    const duration = 1500; // Duração da animação em ms
    const intervalTime = 100; // Intervalo de atualização dos números

    // Loop de animação
    animationInterval = setInterval(() => {
        // Gera números aleatórios temporários
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

/**
 * Finaliza a animação e exibe os resultados reais definitivos.
 * Aplica efeitos visuais de conclusão (escala e cor dourada).
 */
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

    // Efeito de "Pop" no resultado final
    resEl.style.transition = "all 0.2s ease";
    resEl.style.color = "#d4af37"; 
    resEl.style.transform = "scale(1.3)";
    setTimeout(() => { resEl.style.transform = "scale(1)"; }, 200);

    // Fecha o Toast automaticamente após 8 segundos
    toastTimer = setTimeout(() => {
        document.getElementById('diceToast').classList.remove('show');
    }, 8000);
}

/**
 * Configura os eventos de clique para disparar rolagens.
 * Adiciona listeners às linhas da tabela de perícias e aos círculos de atributos.
 */
function setupRollEvents() {
    // Configura eventos nas linhas da tabela de perícias
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
    // Configura eventos nos círculos de atributos principais
    const attributes = ['attrForca', 'attrDestreza', 'attrConstituicao', 'attrInteligencia', 'attrSabedoria', 'attrCarisma'];
    attributes.forEach(attrId => {
        const input = document.getElementById(attrId);
        if(!input) return;
        const box = input.closest('.attr-circle');
        if(box) {
            box.style.cursor = "pointer";
            box.title = "Clique para rolar";
            box.addEventListener('click', (e) => {
                // Evita rolar se o clique for dentro do input de edição
                if (e.target.tagName === 'INPUT') return;
                const label = box.querySelector('label').innerText;
                rollSystem(`Teste de ${label}`, attrId, null);
            });
        }
    });

    // Configura o botão de fechar manual do Toast
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