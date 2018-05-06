; (function () {
    let app = {
        isLoading: true,
        moduleList: [],
        container: document.querySelector('.main'),
        spinner: document.querySelector('.loader')
    }

    if (app.isLoading) {
        app.spinner.setAttribute('hidden', true);
        app.container.removeAttribute('hidden');
        app.isLoading = false;
    }

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js')
            .then(registeration => {
                console.log('支持sw:' + registeration.scope);
                console.log('Service Worker Registered');
            })
            .catch(err => {
                console.log(err);
            });
    }
})();