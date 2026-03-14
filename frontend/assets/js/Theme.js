
(function() {
    const THEME_KEY = 'bcTheme';
    const THEMES = ['padrao', 'sozoku', 'nozomu', 'ryusei', 'mestre'];

    function applyTheme(theme) {
        const body = document.body;
        if (!body) return;

        THEMES.forEach(t => body.classList.remove(`theme-${t}`));
        const nextTheme = THEMES.includes(theme) ? theme : 'padrao';
        body.classList.add(`theme-${nextTheme}`);
        localStorage.setItem(THEME_KEY, nextTheme);
    }

    function syncPickers(theme) {
        document.querySelectorAll('.theme-picker').forEach(select => {
            select.value = theme;
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        const storedTheme = localStorage.getItem(THEME_KEY) || 'padrao';
        applyTheme(storedTheme);
        syncPickers(storedTheme);

        document.querySelectorAll('.theme-picker').forEach(select => {
            select.addEventListener('change', (e) => {
                const next = e.target.value;
                applyTheme(next);
                syncPickers(next);
            });
        });
    });
})();
