/*
    Script responsável pela lógica da tela de Login.
    Gerencia a autenticação, armazenamento do token e redirecionamento.
*/

// Inicializa o script após o carregamento do DOM
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');

    // Intercepta o envio do formulário de login
    loginForm.addEventListener('submit', async function(event) {
        event.preventDefault(); // Impede o reload da página

        // Obtém credenciais dos inputs
        const username = document.getElementById('login__username-user').value;
        const password = document.getElementById('login__password-user').value;
        
        // Configura feedback visual no botão de login
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerText;

        submitBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> ENTRANDO...';
        submitBtn.disabled = true;

        try {
            // Envia requisição de autenticação para a API
            const response = await fetch('https://bloodcrown-api.onrender.com/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: username,
                    password: password
                })
            });

            if (response.ok) {
                // Processa o sucesso da autenticação
                const data = await response.json(); 
                
                const token = data.token; 
                
                // Armazena o token JWT no LocalStorage para sessões futuras
                localStorage.setItem('authToken', token);

                // Exibe notificação de sucesso (Toast) no canto da tela
                const Toast = Swal.mixin({
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 2000,
                    timerProgressBar: true,
                    background: '#212529',
                    color: '#fff'
                });

                Toast.fire({
                    icon: 'success',
                    title: 'Login realizado com sucesso!'
                });

                // Aguarda 1 segundo e redireciona para o Dashboard
                setTimeout(() => {
                    window.location.href = 'Dashboard.html';
                }, 1000);

            } else {
                // Lança erro caso as credenciais sejam inválidas
                throw new Error('Usuário ou senha incorretos.');
            }

        } catch (error) {
            console.error('Erro:', error);
            
            // Exibe modal de erro de acesso
            Swal.fire({
                icon: 'error',
                title: 'Acesso Negado',
                text: 'Verifique suas credenciais e tente novamente.',
                background: '#212529',
                color: '#fff',
                confirmButtonColor: '#d33'
            });

        } finally {
            // Restaura o botão ao estado original
            submitBtn.innerText = originalText;
            submitBtn.disabled = false;
        }
    });
});