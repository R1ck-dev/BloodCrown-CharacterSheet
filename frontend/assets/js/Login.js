document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');

    loginForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        const username = document.getElementById('login__username-user').value;
        const password = document.getElementById('login__password-user').value;
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerText;

        submitBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> ENTRANDO...';
        submitBtn.disabled = true;

        try {
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
                const data = await response.json(); 
                
                const token = data.token; 
                
                localStorage.setItem('authToken', token);

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

                setTimeout(() => {
                    window.location.href = 'Dashboard.html';
                }, 1000);

            } else {
                throw new Error('Usuário ou senha incorretos.');
            }

        } catch (error) {
            console.error('Erro:', error);
            
            Swal.fire({
                icon: 'error',
                title: 'Acesso Negado',
                text: 'Verifique suas credenciais e tente novamente.',
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