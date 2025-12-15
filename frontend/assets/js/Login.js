document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');

    loginForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        const username = document.getElementById('login__username-user').value;
        const password = document.getElementById('login__password-user').value;

        try {
            const token = await loginUser(username, password);
            
            console.log('Login bem-sucedido, token recebido: ', token);
            
            localStorage.setItem('authToken', token);
            
            alert('Login realizado com sucesso!');
            
            window.location.href = 'Dashboard.html';
        } catch (error) {
            console.error('Erro ao tentar login: ', error.message);
            alert(error.message);
        }
    })
})