/*
    BloodCrown — Toast (componente vanilla)

    API global: window.bcToast
      bcToast.success(message)
      bcToast.error(message)
      bcToast.info(message)
      bcToast.warning(message)

    Configuracao:
      bcToast.config({ duration: 3000, position: 'top-right' })

    Notas:
    - Substitui SweetAlert2 Toast.fire() para notificacoes breves.
    - SweetAlert2 continua usado para confirmacoes pesadas (deletar, descansar).
    - Tema coeso com tokens BloodCrown (glass + glow).
*/

(function () {
    'use strict';

    var HOST_ID = 'bc-toast-host';
    var DEFAULT_DURATION = 3000;
    var ANIM_DURATION = 280; // alinhado com --duration-base no CSS

    var ICONS = {
        success: '<i class="fa-solid fa-circle-check"></i>',
        error:   '<i class="fa-solid fa-circle-exclamation"></i>',
        info:    '<i class="fa-solid fa-circle-info"></i>',
        warning: '<i class="fa-solid fa-triangle-exclamation"></i>'
    };

    function ensureHost() {
        var host = document.getElementById(HOST_ID);
        if (!host) {
            host = document.createElement('div');
            host.id = HOST_ID;
            host.className = 'bc-toast-host';
            host.setAttribute('aria-live', 'polite');
            host.setAttribute('aria-atomic', 'true');
            document.body.appendChild(host);
        }
        return host;
    }

    function show(kind, message, opts) {
        opts = opts || {};
        var host = ensureHost();
        var duration = opts.duration != null ? opts.duration : DEFAULT_DURATION;

        var el = document.createElement('div');
        el.className = 'bc-toast bc-toast--' + kind;
        el.setAttribute('role', kind === 'error' ? 'alert' : 'status');

        var iconHtml = ICONS[kind] || '';
        el.innerHTML =
            '<span class="bc-toast__icon">' + iconHtml + '</span>' +
            '<span class="bc-toast__body"></span>';
        // textContent evita XSS caso mensagem venha de servidor
        el.querySelector('.bc-toast__body').textContent = String(message || '');

        host.appendChild(el);

        // Forca reflow para que a transicao de entrada anime do estado inicial
        void el.offsetWidth;
        el.classList.add('bc-toast--show');

        var dismissed = false;
        function dismiss() {
            if (dismissed) return;
            dismissed = true;
            el.classList.remove('bc-toast--show');
            el.classList.add('bc-toast--hide');
            setTimeout(function () {
                if (el.parentNode) el.parentNode.removeChild(el);
            }, ANIM_DURATION + 50);
        }

        if (duration > 0) setTimeout(dismiss, duration);
        el.addEventListener('click', dismiss);

        return { dismiss: dismiss, el: el };
    }

    window.bcToast = {
        success: function (msg, opts) { return show('success', msg, opts); },
        error:   function (msg, opts) { return show('error',   msg, opts); },
        info:    function (msg, opts) { return show('info',    msg, opts); },
        warning: function (msg, opts) { return show('warning', msg, opts); }
    };
})();
