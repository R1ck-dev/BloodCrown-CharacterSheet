const skillMap = {
    'skillAtletismo': 'attrForca',
    'skillLuta': 'attrForca',

    'skillFurtividade': 'attrDestreza',
    'skillIniciativa': 'attrDestreza',
    'skillLadinagem': 'attrDestreza',
    'skillPontaria': 'attrDestreza',
    'skillReflexos': 'attrDestreza',

    'skillConhecimento': 'attrInteligencia',
    'skillConsertar': 'attrInteligencia',
    'skillInvestigacao': 'attrInteligencia',
    'skillMedicina': 'attrInteligencia',
    'skillMente': 'attrInteligencia',
    'skillSobrevivencia': 'attrInteligencia',

    'skillDiplomacia': 'attrCarisma',
    'skillDomar': 'attrCarisma',
    'skillEmpatia': 'attrCarisma',
    'skillIntimidar': 'attrCarisma',
    'skillLabia': 'attrCarisma',
    'skillSeduzir': 'attrCarisma',

    'skillFortitude': 'attrConstituicao',

    'skillIntuicao': 'attrSabedoria',
    'skillMagia': 'attrSabedoria',
    'skillPercepcao': 'attrSabedoria'
}

//- sourceName: Nome para mostrar no título, ex: "Teste de Luta"
//- attrId: O ID do campo de atributo para saber quantos dados rolar
//- skillInputId: O ID da perícia para pegar o bônus
function rollSystem(sourceName, attrId, skillInputId = null) {
    const attrElement = document.getElementById(attrId);
    let diceCount = parseInt(attrElement.value) || 0;

    if (diceCount < 1) diceCount = 1;

    let bonus = 0;
    if (skillInputId) {
        const skillElement = document.getElementById(skillInputId);
        bonus = parseInt(skillElement.value) || 0; 
    }

    let rolls = [];

    for (let i = 0; i < diceCount; i++) {
        //Math.random() gera 0.0 até 0.999
        //Multiplica por 20 (agora 0 a 19.99)
        //Math.ceil arredonda para cima (1 a 20)
        const result = Math.ceil(Math.random() * 20);
        rolls.push(result);
    }

    //"..." tiram os números de dentro da lista
    const bestDice = Math.max(...rolls);

    const finalResult = bestDice + bonus;

    showModal(sourceName, rolls, bestDice, bonus, finalResult);
}

//Preencher o HTML do modal
let toastTimer = null;

function showModal(title, rolls, best, bonus, total) {
    const toast = document.getElementById('diceToast');

    document.getElementById('rollTitle').innerText = title;
    document.getElementById('diceRolled').innerText = `[ ${rolls.join(', ')} ]`;
    
    const bestEl = document.getElementById('bestDice');
    if (bestEl) bestEl.innerText = best;

    //Se o bônus for positivo, coloca um "+" na frente
    document.getElementById('modifierValue').innerText = bonus >= 0 ? `+${bonus}` : bonus;

    document.getElementById('finalResult').innerText = total;

    toast.classList.add('show');

    if(toastTimer) clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
        toast.classList.remove('show');
    }, 10000);
}

//Funcão de configuração para percorrer o site procurando os elementos e adicionando o "clique" neles
function setupRollEvents() {
    //Configura clique nas perícias
    //Object.entries transforma o mapa em pares [chave, valor] para poder passar um por um
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

    //Configurando clique nos atributos para testes puros.
    const attributes = ['attrForca', 'attrDestreza', 'attrConstituicao', 'attrInteligencia', 'attrSabedoria', 'attrCarisma'];

    attributes.forEach(attrId => {
        const input = document.getElementById(attrId);
        if(!input) return;

        const box = input.closest('.attr-circle');

        if(box) {
            box.style.cursor = "pointer";
            box.title = "Clique para rolar teste de atributo puro";

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
        });
    }
}