document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('register-form');

    registerForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        const username = document.getElementById('register__username-user').value;
        const password = document.getElementById('register__password-user').value;
        const confirmPassword = document.getElementById('register__confirm-password-user').value;

        // Validação de senha com SweetAlert
        if (password !== confirmPassword) {
            Swal.fire({
                icon: 'warning',
                title: 'Atenção',
                text: 'As senhas não conferem. Por favor, digite novamente.',
                background: '#212529',
                color: '#fff',
                confirmButtonColor: '#7b2cbf'
            });
            return;
        }

        // Feedback visual de carregamento
        const submitBtn = registerForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerText;
        submitBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> CRIANDO...';
        submitBtn.disabled = true;

        try {
            // Chamada direta para a API
            const response = await fetch('http://localhost:8080/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: username,
                    password: password,
                    role: 'USER' // Padrão
                })
            });

            if (response.ok) {
                // Sucesso!
                Swal.fire({
                    icon: 'success',
                    title: 'Bem-vindo!',
                    text: 'Usuário cadastrado com sucesso!',
                    background: '#212529',
                    color: '#fff',
                    confirmButtonColor: '#7b2cbf'
                }).then(() => {
                    window.location.href = 'index.html'; // Redireciona para o login
                });
            } else {
                // Erro vindo do backend (ex: usuário já existe)
                // Tentamos ler a mensagem de erro se houver texto
                const errorText = await response.text(); 
                throw new Error(errorText || 'Erro ao criar conta.');
            }

        } catch (error) {
            console.error('Erro:', error);
            Swal.fire({
                icon: 'error',
                title: 'Erro',
                text: 'Não foi possível realizar o cadastro. Tente outro nome de usuário.',
                background: '#212529',
                color: '#fff',
                confirmButtonColor: '#d33'
            });
        } finally {
            // Restaura o botão
            submitBtn.innerText = originalText;
            submitBtn.disabled = false;
        }
    });
});