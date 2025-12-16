document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    const displayElement = document.getElementById('charIdDisplay');

    if (id) {
        displayElement.innerText = id;
        console.log("Editando personagem:", id);
        
    } else {
        displayElement.innerText = "Erro: Nenhum ID fornecido.";
        displayElement.style.color = "red";
    }
});