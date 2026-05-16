/*
    BloodCrown - Sistema de Animacao (PoC enxuto)

    API global: window.bcAnim
    Estrategia: CSS-driven. Helpers apenas adicionam/removem classes definidas
    em /styles/animations.css. Quando a Fase 5 precisar de timelines (rolagem
    de dado, level up confetti, modal entry), GSAP entra como CDN e este
    arquivo ganha mais helpers.

    Helpers expostos:
      bcAnim.respectsReducedMotion()        -> boolean
      bcAnim.shake(el, durationMs?)         -> dispara tremor curto
      bcAnim.applyGlow(el, color)           -> halo pulsante ("purple" ou "gold")
      bcAnim.removeGlow(el)                 -> remove halo
      bcAnim.flashSuccess(el)               -> flash verde 1s
      bcAnim.flashBlood(el)                 -> flash sangue 600ms
      bcAnim.attachLowHpPulse(barEl, getRatio)
          -> ativa/desativa pulso vermelho na barra de HP quando ratio < 0.25.
             getRatio() deve retornar numero entre 0 e 1.
*/

(function () {
    'use strict';

    var ANIM_CLASS_PREFIX = 'bc-';
    var LOW_HP_THRESHOLD = 0.25;

    // Decisao de projeto: ignorar prefers-reduced-motion. Animacoes sao
    // identidade gamificada do BloodCrown. Funcao mantida na API para nao
    // quebrar callers, mas sempre retorna false.
    function respectsReducedMotion() {
        return false;
    }

    // Helper interno: aplica classe + remove apos animation end
    function playOnce(el, className, fallbackMs) {
        if (!el) return;
        el.classList.remove(className);
        // reflow forcado para permitir reaplicar a mesma classe consecutivamente
        void el.offsetWidth;
        el.classList.add(className);
        var cleanup = function () {
            el.classList.remove(className);
            el.removeEventListener('animationend', cleanup);
        };
        el.addEventListener('animationend', cleanup);
        // fallback de seguranca caso animationend nao dispare (display:none, etc.)
        if (fallbackMs) setTimeout(cleanup, fallbackMs);
    }

    function shake(el) {
        playOnce(el, ANIM_CLASS_PREFIX + 'shake', 700);
    }

    function flashSuccess(el) {
        playOnce(el, ANIM_CLASS_PREFIX + 'flash-success', 1200);
    }

    function flashBlood(el) {
        playOnce(el, ANIM_CLASS_PREFIX + 'flash-blood', 800);
    }

    function applyGlow(el, color) {
        if (!el) return;
        var className = ANIM_CLASS_PREFIX + 'glow-' + (color === 'gold' ? 'gold' : 'purple');
        el.classList.add(className);
    }

    function removeGlow(el) {
        if (!el) return;
        el.classList.remove(ANIM_CLASS_PREFIX + 'glow-purple');
        el.classList.remove(ANIM_CLASS_PREFIX + 'glow-gold');
    }

    /*
        Anexa pulso de HP critico a uma barra de progresso.
        Reavaliacao automatica ao chamar update() (idempotente).
        Returns: { update(), destroy() }
    */
    function attachLowHpPulse(barEl, getRatio) {
        if (!barEl || typeof getRatio !== 'function') return null;
        var className = ANIM_CLASS_PREFIX + 'pulse-hp-critical';

        function update() {
            var ratio = Number(getRatio());
            if (isNaN(ratio)) return;
            var shouldPulse = ratio > 0 && ratio < LOW_HP_THRESHOLD;
            if (shouldPulse) {
                barEl.classList.add(className);
            } else {
                barEl.classList.remove(className);
            }
            // Log temporario (PoC Fase 3) para validar comportamento via console
            if (window.bcAnimDebug) {
                console.log('[bcAnim] HP ratio:', ratio.toFixed(2), 'pulse:', shouldPulse, 'classes:', barEl.className);
            }
        }

        function destroy() {
            barEl.classList.remove(className);
        }

        update();
        return { update: update, destroy: destroy };
    }

    window.bcAnim = {
        respectsReducedMotion: respectsReducedMotion,
        shake:                 shake,
        applyGlow:             applyGlow,
        removeGlow:            removeGlow,
        flashSuccess:          flashSuccess,
        flashBlood:            flashBlood,
        attachLowHpPulse:      attachLowHpPulse
    };
})();
