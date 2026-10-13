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
    let animationFrameId;

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
            this.size = Math.random() * 3 + 1;
            this.speedY = Math.random() * 0.8 + 0.3;
            this.speedX = (Math.random() - 0.5) * 0.4;
            this.opacity = Math.random() * 0.7 + 0.2;
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
        animationFrameId = requestAnimationFrame(animateParticles);
    }
    animateParticles();

    // ----------------------------------------------------
    // 3. Elements & Config Bindings
    // ----------------------------------------------------
    if (CONFIG.serverName) {
        document.getElementById('serverName').textContent = CONFIG.serverName;
    }
    if (CONFIG.serverIp) {
        const displayIp = document.getElementById('displayServerIp');
        if (displayIp) displayIp.textContent = CONFIG.serverIp;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const sessionCode = urlParams.get('code') || urlParams.get('tgWebAppStartParam') || '';
    const sessionNick = urlParams.get('nick') || '';
    const sessionIp = urlParams.get('ip') || '';

    // Views
    const views = {
        menu: document.getElementById('menuView'),
        auth: document.getElementById('authView'),
        online: document.getElementById('onlineView'),
        map: document.getElementById('mapView'),
        info: document.getElementById('infoView'),
        success: document.getElementById('successView'),
        error: document.getElementById('errorView')
    };

    const pageTitle = document.getElementById('pageTitle');
    const pageSubtitle = document.getElementById('pageSubtitle');
    const btnBackToMenu = document.getElementById('btnBackToMenu');

    // Menu Buttons
    const menuBtnAuth = document.getElementById('menuBtnAuth');
    const menuBtnOnline = document.getElementById('menuBtnOnline');
    const menuBtnMap = document.getElementById('menuBtnMap');
    const menuBtnInfo = document.getElementById('menuBtnInfo');

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
    const statusPill = document.getElementById('statusPill');
    const btnConfirm = document.getElementById('btnConfirm');
    const btnReject = document.getElementById('btnReject');
    const pinBoxes = document.querySelectorAll('.pin-box');
    const btnManualSubmit = document.getElementById('btnManualSubmit');

    // Online Elements
    const menuOnlineCount = document.getElementById('menuOnlineCount');
    const statOnlineCount = document.getElementById('statOnlineCount');
    const statMaxCount = document.getElementById('statMaxCount');
    const onlineProgressFill = document.getElementById('onlineProgressFill');
    const btnRefreshOnline = document.getElementById('btnRefreshOnline');

    // BlueMap Elements
    const mapFrame = document.getElementById('mapFrame');
    const mapLoader = document.getElementById('mapLoader');
    const btnOpenMapExternal = document.getElementById('btnOpenMapExternal');

    // Info Elements
    const btnCopyIp = document.getElementById('btnCopyIp');
    const copyToast = document.getElementById('copyToast');

    // Result Elements
    const btnCloseApp = document.getElementById('btnCloseApp');
    const btnRetry = document.getElementById('btnRetry');

    // ----------------------------------------------------
    // 4. View Switching & Navigation Router
    // ----------------------------------------------------
    let currentView = 'menu';

    function switchView(targetView) {
        triggerHaptic('light');

        Object.keys(views).forEach(v => {
            if (views[v]) views[v].style.display = 'none';
        });

        if (views[targetView]) {
            views[targetView].style.display = 'block';
            currentView = targetView;
        }

        // Handle Titles & Back Button
        if (targetView === 'menu') {
            pageTitle.textContent = "Главное меню";
            pageSubtitle.textContent = "Выберите нужный раздел";
            btnBackToMenu.style.display = 'none';
            if (tg?.BackButton) tg.BackButton.hide();
        } else {
            btnBackToMenu.style.display = 'flex';
            if (tg?.BackButton) tg.BackButton.show();

            switch (targetView) {
                case 'auth':
                    pageTitle.textContent = "Авторизация";
                    pageSubtitle.textContent = "Подтверждение игровой сессии";
                    break;
                case 'online':
                    pageTitle.textContent = "Онлайн игроков";
                    pageSubtitle.textContent = "Статистика подключений";
                    fetchOnlineStatus();
                    break;
                case 'map':
                    pageTitle.textContent = "Карта сервера";
                    pageSubtitle.textContent = "Интерактивная 3D карта";
                    loadBlueMap();
                    break;
                case 'info':
                    pageTitle.textContent = "О сервере";
                    pageSubtitle.textContent = "Информация и подключение";
                    break;
            }
        }
    }

    btnBackToMenu.addEventListener('click', () => switchView('menu'));
    if (tg?.BackButton) {
        tg.BackButton.onClick(() => switchView('menu'));
    }

    // Menu Card Clicks
    menuBtnAuth.addEventListener('click', () => switchView('auth'));
    menuBtnOnline.addEventListener('click', () => switchView('online'));
    menuBtnMap.addEventListener('click', () => switchView('map'));
    menuBtnInfo.addEventListener('click', () => switchView('info'));

    if (btnOpenAuthFromBanner) {
        btnOpenAuthFromBanner.addEventListener('click', (e) => {
            e.stopPropagation();
            switchView('auth');
        });
    }

    // ----------------------------------------------------
    // 5. Session Setup (QR / Link Detection)
    // ----------------------------------------------------
    if (sessionCode && sessionCode.trim().length > 0) {
        const cleanCode = sessionCode.trim();

        // Show banner on Main Menu
        activeSessionBanner.style.display = 'flex';
        bannerCode.textContent = cleanCode;
        authBadge.style.display = 'inline-block';

        // Prepare Auth Box
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

        // If opened directly from QR code, take player straight to Auth screen!
        switchView('auth');
    } else {
        // No session code: Auth screen has manual PIN entry
        authConfirmBox.style.display = 'none';
        authManualBox.style.display = 'block';
        setupPinInputs();
    }

    // ----------------------------------------------------
    // 6. Online Status Fetching
    // ----------------------------------------------------
    function fetchOnlineStatus() {
        menuOnlineCount.textContent = "Загрузка...";

        // Mode A: If API url is configured
        if (CONFIG.apiUrl && CONFIG.apiUrl.startsWith("http")) {
            fetch(`${CONFIG.apiUrl}/api/status`)
                .then(res => res.json())
                .then(data => updateOnlineUI(data.players || 0, data.maxPlayers || 100))
                .catch(() => checkPublicStatus());
        } else {
            checkPublicStatus();
        }
    }

    function checkPublicStatus() {
        const host = CONFIG.serverIp || 'localhost';
        if (host === 'localhost' || host.startsWith('127.') || host.startsWith('192.168.')) {
            // Local network testing: show active status with default/live stats
            updateOnlineUI(1, 100);
            return;
        }

        fetch(`https://api.mcstatus.io/v2/status/java/${encodeURIComponent(host)}`)
            .then(res => res.json())
            .then(data => {
                if (data.online) {
                    updateOnlineUI(data.players.online, data.players.max);
                } else {
                    updateOnlineUI(0, 100);
                }
            })
            .catch(() => updateOnlineUI(1, 100));
    }

    function updateOnlineUI(online, max) {
        menuOnlineCount.textContent = `${online} / ${max}`;
        statOnlineCount.textContent = online;
        statMaxCount.textContent = `/ ${max}`;
        const pct = Math.max(3, Math.min(100, (online / (max || 100)) * 100));
        onlineProgressFill.style.width = `${pct}%`;
    }

    if (btnRefreshOnline) {
        btnRefreshOnline.addEventListener('click', () => {
            triggerHaptic('medium');
            fetchOnlineStatus();
        });
    }

    // Fetch initial online on load
    fetchOnlineStatus();

    // ----------------------------------------------------
    // 7. BlueMap Integration
    // ----------------------------------------------------
    let mapLoaded = false;
    function loadBlueMap() {
        const url = CONFIG.mapUrl || 'http://localhost:8100';
        btnOpenMapExternal.href = url;

        if (!mapLoaded) {
            mapFrame.src = url;
            mapFrame.onload = () => {
                mapLoader.classList.add('hidden');
                mapLoaded = true;
            };
            // Fallback timeout to hide loader
            setTimeout(() => {
                mapLoader.classList.add('hidden');
            }, 3000);
        }
    }

    // ----------------------------------------------------
    // 8. Auth Confirmation Logic
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

    // ----------------------------------------------------
    // 9. Copy IP & Result Handlers
    // ----------------------------------------------------
    if (btnCopyIp) {
        btnCopyIp.addEventListener('click', () => {
            const ip = CONFIG.serverIp || 'localhost';
            navigator.clipboard.writeText(ip).then(() => {
                triggerHaptic('success');
                copyToast.style.display = 'block';
                setTimeout(() => { copyToast.style.display = 'none'; }, 2500);
            }).catch(() => {});
        });
    }

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
