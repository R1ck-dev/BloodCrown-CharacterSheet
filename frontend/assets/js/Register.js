document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('register-form');

    registerForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        const username = document.getElementById('register__username-user').value;
        const password = document.getElementById('register__password-user').value;
        const confirmPassword = document.getElementById('register__confirm-password-user').value;

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

        const submitBtn = registerForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerText;
        submitBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> CRIANDO...';
        submitBtn.disabled = true;

        try {
            const response = await fetch('https://bloodcrown-api.onrender.com/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: username,
                    password: password,
                    role: 'USER' 
                })
            });

            if (response.ok) {
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
            submitBtn.innerText = originalText;
            submitBtn.disabled = false;
        }
    });
});