/*
    BloodCrown - Gamificacao de eventos criticos
    Depende de canvas-confetti (carregado via CDN no HTML) e bc-anim.js.

    API global: window.bcCrit
      bcCrit.trigger(originEl)   -> nat 20: confetti curto dourado + shake + glow
      bcCrit.levelUp(originEl)   -> level up: confetti maior + flash branco
      bcCrit.damageHit(originEl) -> dano alto: shake + flash blood (sem confetti)
*/

(function () {
    'use strict';

    var COOLDOWN_MS = 1500;
    var lastTriggerAt = 0;

    var GOLD_COLORS = ['#D4AF37', '#F1D77A', '#FFFFFF', '#E6C34A'];
    var PURPLE_COLORS = ['#7B2CBF', '#9D4EDD', '#C8A4FF', '#FFFFFF'];

    function originOf(el) {
        if (!el || !el.getBoundingClientRect) {
            return { x: 0.5, y: 0.5 };
        }
        var rect = el.getBoundingClientRect();
        var x = (rect.left + rect.width / 2) / window.innerWidth;
        var y = (rect.top + rect.height / 2) / window.innerHeight;
        return { x: Math.max(0, Math.min(1, x)), y: Math.max(0, Math.min(1, y)) };
    }

    function fireConfetti(opts) {
        if (typeof window.confetti !== 'function') {
            console.warn('[bcCrit] canvas-confetti nao carregado — pulando confetti visual');
            return;
        }
        window.confetti(opts);
    }

    function trigger(originEl) {
        var now = Date.now();
        if (now - lastTriggerAt < COOLDOWN_MS) return;
        lastTriggerAt = now;

        var origin = originOf(originEl);

        fireConfetti({
            particleCount: 60,
            spread: 70,
            startVelocity: 35,
            colors: GOLD_COLORS,
            origin: origin,
            scalar: 1.2,
            zIndex: 10000
        });

        if (window.bcAnim) {
            if (originEl) window.bcAnim.shake(originEl);
            if (originEl) {
                window.bcAnim.applyGlow(originEl, 'gold');
                setTimeout(function () { window.bcAnim.removeGlow(originEl); }, 1600);
            }
        }
    }

    function levelUp(originEl) {
        var origin = originOf(originEl);

        // Burst central + dois laterais para sensacao "epica"
        fireConfetti({
            particleCount: 120,
            spread: 90,
            startVelocity: 45,
            colors: GOLD_COLORS,
            origin: origin,
            scalar: 1.4,
            zIndex: 10000
        });
        setTimeout(function () {
            fireConfetti({
                particleCount: 50,
                spread: 60,
                angle: 60,
                colors: PURPLE_COLORS,
                origin: { x: 0, y: origin.y },
                zIndex: 10000
            });
            fireConfetti({
                particleCount: 50,
                spread: 60,
                angle: 120,
                colors: PURPLE_COLORS,
                origin: { x: 1, y: origin.y },
                zIndex: 10000
            });
        }, 200);

        if (window.bcAnim && originEl) {
            window.bcAnim.applyGlow(originEl, 'gold');
            setTimeout(function () { window.bcAnim.removeGlow(originEl); }, 2400);
        }
    }

    function damageHit(originEl) {
        if (window.bcAnim && originEl) {
            window.bcAnim.shake(originEl);
            window.bcAnim.flashBlood(originEl);
        }
    }

    window.bcCrit = {
        trigger: trigger,
        levelUp: levelUp,
        damageHit: damageHit
    };
})();
