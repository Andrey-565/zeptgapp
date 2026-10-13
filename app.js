document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------
    // 1. Telegram WebApp SDK Initialization
    // ----------------------------------------------------
    const tg = window.Telegram?.WebApp;
    if (tg) {
        tg.ready();
        tg.expand();
        if (tg.setHeaderColor) tg.setHeaderColor('#0a0d14');
        if (tg.setBackgroundColor) tg.setBackgroundColor('#0a0d14');
    }

    function triggerHaptic(type = 'light') {
        try {
            if (tg?.HapticFeedback) {
                if (type === 'success' || type === 'warning' || type === 'error') {
                    tg.HapticFeedback.notificationOccurred(type);
                } else if (type === 'selection') {
                    tg.HapticFeedback.selectionChanged();
                } else {
                    tg.HapticFeedback.impactOccurred(type);
                }
            }
        } catch (_) {}
    }

    // ----------------------------------------------------
    // 2. Animated Particle Background Canvas
    // ----------------------------------------------------
    const canvas = document.getElementById('bgCanvas');
    const ctx = canvas.getContext('2d');
    let particles = [];

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    class Particle {
        constructor() {
            this.reset();
        }
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = canvas.height + Math.random() * 20;
            this.size = Math.random() * 2.8 + 1;
            this.speedY = Math.random() * 0.7 + 0.3;
            this.speedX = (Math.random() - 0.5) * 0.35;
            this.opacity = Math.random() * 0.6 + 0.2;
            this.color = Math.random() > 0.4 ? '#10b981' : '#06b6d4';
        }
        update() {
            this.y -= this.speedY;
            this.x += this.speedX;
            if (this.y < -10) this.reset();
        }
        draw() {
            ctx.fillStyle = this.color;
            ctx.globalAlpha = this.opacity;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    const particleCount = Math.min(45, Math.floor(window.innerWidth / 10));
    for (let i = 0; i < particleCount; i++) {
        const p = new Particle();
        p.y = Math.random() * canvas.height;
        particles.push(p);
    }

    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        requestAnimationFrame(animateParticles);
    }
    animateParticles();

    // ----------------------------------------------------
    // 3. Elements & URL Query Parsing
    // ----------------------------------------------------
    if (CONFIG.serverName) {
        document.getElementById('serverName').textContent = CONFIG.serverName;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const sessionCode = urlParams.get('code') || urlParams.get('tgWebAppStartParam') || '';
    const sessionNick = urlParams.get('nick') || '';
    const sessionIp = urlParams.get('ip') || '';

    // Views
    const views = {
        menu: document.getElementById('menuView'),
        auth: document.getElementById('authView'),
        map: document.getElementById('mapView'),
        placeholder: document.getElementById('placeholderView'),
        success: document.getElementById('successView'),
        error: document.getElementById('errorView')
    };

    const pageTitle = document.getElementById('pageTitle');
    const pageSubtitle = document.getElementById('pageSubtitle');
    const btnBackToMenu = document.getElementById('btnBackToMenu');

    // Menu Cards
    const menuBtnAuth = document.getElementById('menuBtnAuth');
    const menuBtnMap = document.getElementById('menuBtnMap');
    const activeSessionBanner = document.getElementById('activeSessionBanner');
    const bannerCode = document.getElementById('bannerCode');
    const btnOpenAuthFromBanner = document.getElementById('btnOpenAuthFromBanner');
    const authBadge = document.getElementById('authBadge');

    // Auth Elements
    const authConfirmBox = document.getElementById('authConfirmBox');
    const authManualBox = document.getElementById('authManualBox');
    const playerAvatar = document.getElementById('playerAvatar');
    const playerName = document.getElementById('playerName');
    const sessionCodeBadge = document.getElementById('sessionCodeBadge');
    const playerIp = document.getElementById('playerIp');
    const ipRow = document.getElementById('ipRow');
    const btnConfirm = document.getElementById('btnConfirm');
    const btnReject = document.getElementById('btnReject');
    const pinBoxes = document.querySelectorAll('.pin-box');
    const btnManualSubmit = document.getElementById('btnManualSubmit');

    // BlueMap Elements
    const btnLaunchMapDirect = document.getElementById('btnLaunchMapDirect');
    const btnCopyMapLink = document.getElementById('btnCopyMapLink');
    const mapCopyToast = document.getElementById('mapCopyToast');

    // Placeholder Elements
    const placeholderIcon = document.getElementById('placeholderIcon');
    const placeholderTitle = document.getElementById('placeholderTitle');
    const placeholderDesc = document.getElementById('placeholderDesc');
    const btnPlaceholderBack = document.getElementById('btnPlaceholderBack');

    // Result Buttons
    const btnCloseApp = document.getElementById('btnCloseApp');
    const btnRetry = document.getElementById('btnRetry');

    // Dock Tabs
    const dockTabs = document.querySelectorAll('.dock-tab');

    // ----------------------------------------------------
    // 4. View Switching & Router
    // ----------------------------------------------------
    function switchView(targetView) {
        triggerHaptic('light');

        Object.keys(views).forEach(v => {
            if (views[v]) views[v].style.display = 'none';
        });

        if (views[targetView]) {
            views[targetView].style.display = 'block';
        }

        // Header and Back Button
        if (targetView === 'menu') {
            pageTitle.textContent = "Главное меню";
            pageSubtitle.textContent = "Выберите нужный раздел";
            btnBackToMenu.style.display = 'none';
            if (tg?.BackButton) tg.BackButton.hide();
            setActiveDockTab('home');
        } else {
            btnBackToMenu.style.display = 'flex';
            if (tg?.BackButton) tg.BackButton.show();

            switch (targetView) {
                case 'auth':
                    pageTitle.textContent = "Авторизация";
                    pageSubtitle.textContent = "Подтверждение игровой сессии";
                    break;
                case 'map':
                    pageTitle.textContent = "Карта сервера";
                    pageSubtitle.textContent = "Интерактивная 3D карта";
                    break;
            }
        }
    }

    btnBackToMenu.addEventListener('click', () => switchView('menu'));
    if (tg?.BackButton) {
        tg.BackButton.onClick(() => switchView('menu'));
    }

    menuBtnAuth.addEventListener('click', () => switchView('auth'));
    menuBtnMap.addEventListener('click', () => switchView('map'));

    if (btnOpenAuthFromBanner) {
        btnOpenAuthFromBanner.addEventListener('click', (e) => {
            e.stopPropagation();
            switchView('auth');
        });
    }

    // ----------------------------------------------------
    // 5. Floating Bottom Dock Navigation (Фото 3)
    // ----------------------------------------------------
    function setActiveDockTab(tabName) {
        dockTabs.forEach(tab => {
            if (tab.dataset.tab === tabName) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });
    }

    dockTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            triggerHaptic('selection');
            const target = tab.dataset.tab;
            setActiveDockTab(target);

            switch (target) {
                case 'home':
                    switchView('menu');
                    break;
                case 'shop':
                    placeholderIcon.textContent = "💸";
                    placeholderTitle.textContent = "Магазин и Донат";
                    placeholderDesc.textContent = "Раздел игрового магазина и донат-привилегий скоро станет доступен!";
                    pageTitle.textContent = "Магазин";
                    pageSubtitle.textContent = "Игровые привилегии и бонусы";
                    switchView('placeholder');
                    break;
                case 'settings':
                    placeholderIcon.textContent = "⚙️";
                    placeholderTitle.textContent = "Настройки";
                    placeholderDesc.textContent = "Управление уведомлениями, темой оформления и безопасностью.";
                    pageTitle.textContent = "Настройки";
                    pageSubtitle.textContent = "Параметры приложения";
                    switchView('placeholder');
                    break;
                case 'profile':
                    placeholderIcon.textContent = "👤";
                    placeholderTitle.textContent = sessionNick ? `Профиль: ${sessionNick}` : "Профиль игрока";
                    placeholderDesc.textContent = sessionNick 
                        ? `Привязанный аккаунт: ${sessionNick}. Статистика и достижения появятся здесь.`
                        : "Войдите на сервер Minecraft для синхронизации вашего профиля.";
                    pageTitle.textContent = "Профиль";
                    pageSubtitle.textContent = "Статистика вашего персонажа";
                    switchView('placeholder');
                    break;
            }
        });
    });

    if (btnPlaceholderBack) {
        btnPlaceholderBack.addEventListener('click', () => switchView('menu'));
    }

    // ----------------------------------------------------
    // 6. BlueMap 3D Launch Action
    // ----------------------------------------------------
    if (btnLaunchMapDirect) {
        btnLaunchMapDirect.addEventListener('click', () => {
            triggerHaptic('medium');
            const url = CONFIG.mapUrl || 'http://192.168.0.105:8100';
            if (tg?.openLink) {
                tg.openLink(url);
            } else {
                window.open(url, '_blank');
            }
        });
    }

    if (btnCopyMapLink) {
        btnCopyMapLink.addEventListener('click', () => {
            triggerHaptic('light');
            const url = CONFIG.mapUrl || 'http://192.168.0.105:8100';
            navigator.clipboard.writeText(url).then(() => {
                mapCopyToast.style.display = 'block';
                setTimeout(() => { mapCopyToast.style.display = 'none'; }, 2500);
            }).catch(() => {});
        });
    }

    // ----------------------------------------------------
    // 7. Session Detection (QR / Link)
    // ----------------------------------------------------
    if (sessionCode && sessionCode.trim().length > 0) {
        const cleanCode = sessionCode.trim();

        activeSessionBanner.style.display = 'flex';
        bannerCode.textContent = cleanCode;
        authBadge.style.display = 'inline-block';

        authConfirmBox.style.display = 'block';
        authManualBox.style.display = 'none';
        sessionCodeBadge.textContent = cleanCode;

        if (sessionNick) {
            playerName.textContent = sessionNick;
            playerAvatar.src = `https://mc-heads.net/avatar/${encodeURIComponent(sessionNick)}/120`;
        }
        if (sessionIp) {
            playerIp.textContent = sessionIp;
            ipRow.style.display = 'flex';
        }

        switchView('auth');
    } else {
        authConfirmBox.style.display = 'none';
        authManualBox.style.display = 'block';
        setupPinInputs();
    }

    // ----------------------------------------------------
    // 8. Auth Confirmation & Rejection Logic
    // ----------------------------------------------------
    btnConfirm.addEventListener('click', () => {
        submitVerification(sessionCodeBadge.textContent);
    });

    btnReject.addEventListener('click', () => {
        if (!confirm("Вы уверены, что хотите отклонить вход?")) return;
        triggerHaptic('warning');

        const currentCode = sessionCodeBadge.textContent;
        const rejectLink = `https://t.me/${CONFIG.botUsername}?start=reject_${currentCode}`;

        if (tg?.openTelegramLink) {
            tg.openTelegramLink(rejectLink);
        } else {
            window.location.href = rejectLink;
        }

        switchView('error');
    });

    function submitVerification(targetCode) {
        btnConfirm.disabled = true;
        btnConfirm.textContent = "Подтверждение...";
        triggerHaptic('medium');

        let sent = false;
        try {
            if (tg?.sendData) {
                tg.sendData(JSON.stringify({ action: "auth", code: targetCode }));
                sent = true;
            }
        } catch (_) {
            sent = false;
        }

        const botLink = `https://t.me/${CONFIG.botUsername}?start=auth_${targetCode}`;
        if (!sent && CONFIG.botUsername) {
            if (tg?.openTelegramLink) {
                tg.openTelegramLink(botLink);
            } else {
                window.location.href = botLink;
            }
        }

        triggerHaptic('success');
        switchView('success');
    }

    // Manual PIN Inputs
    function setupPinInputs() {
        pinBoxes.forEach((box, index) => {
            box.value = '';
            box.addEventListener('input', (e) => {
                const val = e.target.value.replace(/[^0-9]/g, '');
                e.target.value = val;
                if (val && index < pinBoxes.length - 1) {
                    pinBoxes[index + 1].focus();
                }
                checkPin();
            });
            box.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace' && !box.value && index > 0) {
                    pinBoxes[index - 1].focus();
                }
            });
        });
    }

    function checkPin() {
        let pin = '';
        pinBoxes.forEach(b => pin += b.value);
        btnManualSubmit.disabled = (pin.length !== 6);
    }

    btnManualSubmit.addEventListener('click', () => {
        let pin = '';
        pinBoxes.forEach(b => pin += b.value);
        if (pin.length === 6) {
            sessionCodeBadge.textContent = pin;
            submitVerification(pin);
        }
    });

    // Result Button Handlers
    if (btnCloseApp) {
        btnCloseApp.addEventListener('click', () => {
            if (tg?.close) tg.close();
        });
    }

    if (btnRetry) {
        btnRetry.addEventListener('click', () => {
            switchView('menu');
        });
    }
});
