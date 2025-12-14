document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('register-form');

    registerForm.addEventListener('submit', async function(event) {

        event.preventDefault();

        const username = document.getElementById('register__username-user').value;
        const password = document.getElementById('register__password-user').value;
        const confirmPassword = document.getElementById('register__confirm-password-user').value;

        if (password != confirmPassword) {
            alert('As senhas não conferem. Por favor, digite novamente.');
            return;
        }

        try {
            const newUser = await registerUser(username, password);

            console.log('Usuário cadastrado:', newUser);
            alert('Usuário cadastrado com sucesso!');

            window.location.href = 'index.html';
        }
        catch (error) {
            console.error('Erro de rede ao tentar cadastrar: ', error);
            alert('Não foi possível conectar ao servidor.')
        }
        
    })
})