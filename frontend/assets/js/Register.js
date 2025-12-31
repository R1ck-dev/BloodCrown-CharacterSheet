/*
    Script responsável pela lógica da tela de Registro de Usuários.
    Gerencia a validação de formulário, feedback visual e comunicação com a API.
*/

// Aguarda o carregamento completo do DOM antes de anexar os eventos
document.addEventListener('DOMContentLoaded', function() {
    // Obtém a referência do formulário de registro no DOM
    const registerForm = document.getElementById('register-form');

    // Adiciona um ouvinte para o evento de submissão do formulário
    registerForm.addEventListener('submit', async function(event) {
        // Previne o comportamento padrão de recarregar a página ao enviar
        event.preventDefault();

        // Captura os valores inseridos nos campos de entrada
        const username = document.getElementById('register__username-user').value;
        const password = document.getElementById('register__password-user').value;
        const confirmPassword = document.getElementById('register__confirm-password-user').value;

        // Valida se as senhas coincidem antes de prosseguir
        if (password !== confirmPassword) {
            // Exibe alerta visual caso as senhas sejam diferentes
            Swal.fire({
                icon: 'warning',
                title: 'Atenção',
                text: 'As senhas não conferem. Por favor, digite novamente.',
                background: '#212529',
                color: '#fff',
                confirmButtonColor: '#7b2cbf'
            });
            return; // Interrompe a execução
        }

        // Gerencia o estado do botão de envio para evitar múltiplos cliques
        const submitBtn = registerForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerText;
        submitBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> CRIANDO...'; // Adiciona spinner de carregamento
        submitBtn.disabled = true;

        try {
            // Realiza a requisição POST para o endpoint de registro da API
            const response = await fetch('https://bloodcrown-api.onrender.com/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: username,
                    password: password,
                    role: 'USER' // Define o papel padrão como Usuário comum
                })
            });

            // Verifica se a resposta da API foi bem-sucedida (Status 2xx)
            if (response.ok) {
                // Exibe mensagem de sucesso e redireciona para a tela de login
                Swal.fire({
                    icon: 'success',
                    title: 'Bem-vindo!',
                    text: 'Usuário cadastrado com sucesso!',
                    background: '#212529',
                    color: '#fff',
                    confirmButtonColor: '#7b2cbf'
                }).then(() => {
                    window.location.href = 'index.html'; 
                });
            } else {
                // Processa mensagens de erro retornadas pelo backend
                const errorText = await response.text(); 
                throw new Error(errorText || 'Erro ao criar conta.');
            }

        } catch (error) {
            // Loga o erro no console para depuração
            console.error('Erro:', error);
            // Notifica o usuário sobre a falha no cadastro
            Swal.fire({
                icon: 'error',
                title: 'Erro',
                text: 'Não foi possível realizar o cadastro. Tente outro nome de usuário.',
                background: '#212529',
                color: '#fff',
                confirmButtonColor: '#d33'
            });
        } finally {
            // Restaura o estado original do botão independente do resultado
            submitBtn.innerText = originalText;
            submitBtn.disabled = false;
        }
    });
});