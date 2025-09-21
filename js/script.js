document.querySelectorAll('.contact').forEach(element => {
    element.addEventListener('click', function(e) {
        setTimeout(() => {
            const question = window.i18n ? window.i18n.t('feedback.fallback_question') : 'Email client not configured? Copy email to clipboard?';
            const message = window.i18n ? window.i18n.t('feedback.copied_message') : 'Email copied: sergei29.dev@proton.me';
            
            if (confirm(question)) {
                navigator.clipboard.writeText('sergei29.dev@proton.me');
                alert(message);
            }
        }, 500);
    });
});