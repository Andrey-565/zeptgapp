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

    let isHapticEnabled = localStorage.getItem('zeph_setting_haptic') !== 'false';

    function triggerHaptic(type = 'light') {
        if (!isHapticEnabled) return;
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

    let particlesActive = localStorage.getItem('zeph_setting_particles') !== 'false';
    let particleAnimFrame = null;

    function animateParticles() {
        if (!particlesActive) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        particleAnimFrame = requestAnimationFrame(animateParticles);
    }

    if (particlesActive) {
        animateParticles();
    } else {
        canvas.style.display = 'none';
    }

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
        settings: document.getElementById('settingsView'),
        profile: document.getElementById('profileView'),
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

    // ====================================================
    // BILINGUAL TRANSLATION (RU / EN)
    // ====================================================
    const I18N = {
        ru: {
            menu_title: "Главное меню",
            menu_sub: "Выберите нужный раздел",
            auth_title: "Авторизация",
            auth_sub: "Подтверждение игровой сессии",
            map_title: "Карта сервера",
            map_sub: "Интерактивная 3D карта",
            settings_title: "Настройки",
            settings_sub: "Параметры и оформление",
            profile_title: "Профиль",
            profile_sub: "Данные вашего аккаунта",
            shop_title: "Магазин",
            shop_sub: "Игровые привилегии и бонусы",
            shop_placeholder_title: "Магазин и Донат",
            shop_placeholder_desc: "Раздел игрового магазина и донат-привилегий скоро станет доступен!",
            settings_sec_notify: "Уведомления",
            settings_notify_title: "Уведомления о входе",
            settings_notify_desc: "Сообщение в боте при успешной авторизации",
            settings_sec_interface: "Интерфейс и Эффекты",
            settings_theme_title: "Тема оформления",
            settings_theme_desc: "Переключение тёмного и светлого стиля",
            theme_dark: "Тёмная",
            theme_light: "Светлая",
            settings_particles_title: "Анимированный фон",
            settings_particles_desc: "Плавающие частицы и свечение",
            settings_haptic_title: "Тактильный отклик (Haptic)",
            settings_haptic_desc: "Вибрация при кликах и переключении меню",
            settings_lang_title: "Язык приложения",
            settings_lang_desc: "Язык интерфейса Mini App",
            settings_sec_system: "Система",
            settings_version_title: "Версия приложения",
            settings_reload_btn: "🔄 Сбросить кэш и перезагрузить",
            profile_sync_desc: "Синхронизация профиля и статистика скоро",
            coming_soon: "Скоро в обновлении сервера",
            btn_back: "← В главное меню"
        },
        en: {
            menu_title: "Main Menu",
            menu_sub: "Select a section",
            auth_title: "Authorization",
            auth_sub: "Game session confirmation",
            map_title: "Server Map",
            map_sub: "Interactive 3D map",
            settings_title: "Settings",
            settings_sub: "Preferences & appearance",
            profile_title: "Profile",
            profile_sub: "Your account details",
            shop_title: "Store",
            shop_sub: "In-game ranks and perks",
            shop_placeholder_title: "Store & Donations",
            shop_placeholder_desc: "In-game store and donate privileges will be available soon!",
            settings_sec_notify: "Notifications",
            settings_notify_title: "Login Notifications",
            settings_notify_desc: "Receive bot message upon successful login",
            settings_sec_interface: "Interface & Effects",
            settings_theme_title: "Appearance Theme",
            settings_theme_desc: "Toggle between dark and light styles",
            theme_dark: "Dark",
            theme_light: "Light",
            settings_particles_title: "Animated Background",
            settings_particles_desc: "Floating particles and glows",
            settings_haptic_title: "Haptic Feedback",
            settings_haptic_desc: "Vibration on button clicks and tab switching",
            settings_lang_title: "App Language",
            settings_lang_desc: "Language of Mini App interface",
            settings_sec_system: "System",
            settings_version_title: "App Version",
            settings_reload_btn: "🔄 Reset Cache & Reload",
            profile_sync_desc: "Profile synchronization & statistics coming soon",
            coming_soon: "Coming in server update",
            btn_back: "← To Main Menu"
        }
    };

    let currentLang = localStorage.getItem('zeph_lang') || 'ru';
    let currentTheme = localStorage.getItem('zeph_theme') || 'dark';
    let currentView = 'menu';

    function t(key) {
        return I18N[currentLang]?.[key] || key;
    }

    // ----------------------------------------------------
    // 4. View Switching & Router
    // ----------------------------------------------------
    function switchView(targetView) {
        triggerHaptic('light');
        currentView = targetView;

        Object.keys(views).forEach(v => {
            if (views[v]) views[v].style.display = 'none';
        });

        if (views[targetView]) {
            views[targetView].style.display = 'block';
        }

        // Header and Back Button
        if (targetView === 'menu') {
            pageTitle.textContent = t('menu_title');
            pageSubtitle.textContent = t('menu_sub');
            btnBackToMenu.style.display = 'none';
            if (tg?.BackButton) tg.BackButton.hide();
            setActiveDockTab('home');
        } else {
            btnBackToMenu.style.display = 'flex';
            if (tg?.BackButton) tg.BackButton.show();

            switch (targetView) {
                case 'auth':
                    pageTitle.textContent = t('auth_title');
                    pageSubtitle.textContent = t('auth_sub');
                    break;
                case 'map':
                    pageTitle.textContent = t('map_title');
                    pageSubtitle.textContent = t('map_sub');
                    break;
                case 'settings':
                    pageTitle.textContent = t('settings_title');
                    pageSubtitle.textContent = t('settings_sub');
                    setActiveDockTab('settings');
                    break;
                case 'profile':
                    pageTitle.textContent = t('profile_title');
                    pageSubtitle.textContent = t('profile_sub');
                    setActiveDockTab('profile');
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
                    switchView('settings');
                    break;
                case 'profile':
                    switchView('profile');
                    break;
            }
        });
    });

    if (btnPlaceholderBack) {
        btnPlaceholderBack.addEventListener('click', () => switchView('menu'));
    }

    const btnProfileBack = document.getElementById('btnProfileBack');
    if (btnProfileBack) {
        btnProfileBack.addEventListener('click', () => switchView('menu'));
    }

    // ----------------------------------------------------
    // 6. BlueMap 3D Launch Action
    // ----------------------------------------------------
    const btnExpandMap = document.getElementById('btnExpandMap');
    const mapViewport = document.getElementById('mapViewport');
    const mapFrame = document.getElementById('mapFrame');
    const mapPreviewOverlay = document.getElementById('mapPreviewOverlay');

    // Если указана HTTPS ссылка, можно загрузить живую карту прямо внутрь миниатюры
    if (mapFrame && CONFIG.mapUrl && CONFIG.mapUrl.startsWith('https://')) {
        mapFrame.src = CONFIG.mapUrl;
        mapFrame.addEventListener('load', () => {
            if (mapPreviewOverlay) {
                mapPreviewOverlay.classList.add('map-loaded');
            }
        });
    }

    function launchMap() {
        triggerHaptic('medium');
        const url = CONFIG.mapUrl || 'http://192.168.0.105:8100';
        if (tg?.openLink) {
            tg.openLink(url);
        } else {
            window.open(url, '_blank');
        }
    }

    if (btnLaunchMapDirect) {
        btnLaunchMapDirect.addEventListener('click', launchMap);
    }
    if (btnExpandMap) {
        btnExpandMap.addEventListener('click', (e) => {
            e.stopPropagation();
            launchMap();
        });
    }
    if (mapViewport) {
        mapViewport.addEventListener('click', (e) => {
            if (!mapPreviewOverlay || !mapPreviewOverlay.classList.contains('map-loaded')) {
                launchMap();
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
    // 6b. Settings & Theme & Profile Handlers
    // ----------------------------------------------------
    const profileUserAvatar = document.getElementById('profileUserAvatar');
    const profileUserName = document.getElementById('profileUserName');
    const profileUserId = document.getElementById('profileUserId');

    const settingLoginNotify = document.getElementById('settingLoginNotify');
    const settingParticles = document.getElementById('settingParticles');
    const settingHaptic = document.getElementById('settingHaptic');
    const btnClearCacheReload = document.getElementById('btnClearCacheReload');
    const langBtns = document.querySelectorAll('.lang-btn');
    const btnThemeDark = document.getElementById('btnThemeDark');
    const btnThemeLight = document.getElementById('btnThemeLight');

    // Populate user info into Profile view
    if (tg?.initDataUnsafe?.user) {
        const u = tg.initDataUnsafe.user;
        const displayName = [u.first_name, u.last_name].filter(Boolean).join(' ') || (u.username ? '@' + u.username : 'Игрок');
        if (profileUserName) profileUserName.textContent = displayName;
        if (profileUserId) profileUserId.textContent = `Telegram ID: ${u.id}`;
        if (u.photo_url && profileUserAvatar) profileUserAvatar.src = u.photo_url;
    } else if (sessionNick) {
        if (profileUserName) profileUserName.textContent = sessionNick;
        if (profileUserId) profileUserId.textContent = 'Синхронизирован с Minecraft';
        if (profileUserAvatar) profileUserAvatar.src = `https://mc-heads.net/avatar/${encodeURIComponent(sessionNick)}/100`;
    }

    // Theme Switcher (Dark / Light)
    function applyTheme(theme) {
        currentTheme = theme;
        localStorage.setItem('zeph_theme', theme);
        if (theme === 'light') {
            document.body.classList.add('theme-light');
            if (btnThemeLight) btnThemeLight.classList.add('active');
            if (btnThemeDark) btnThemeDark.classList.remove('active');
            if (tg?.setHeaderColor) tg.setHeaderColor('#f1f5f9');
            if (tg?.setBackgroundColor) tg.setBackgroundColor('#f1f5f9');
        } else {
            document.body.classList.remove('theme-light');
            if (btnThemeDark) btnThemeDark.classList.add('active');
            if (btnThemeLight) btnThemeLight.classList.remove('active');
            if (tg?.setHeaderColor) tg.setHeaderColor('#0a0d14');
            if (tg?.setBackgroundColor) tg.setBackgroundColor('#0a0d14');
        }
    }

    if (btnThemeDark) {
        btnThemeDark.addEventListener('click', () => {
            triggerHaptic('selection');
            applyTheme('dark');
        });
    }

    if (btnThemeLight) {
        btnThemeLight.addEventListener('click', () => {
            triggerHaptic('selection');
            applyTheme('light');
        });
    }

    applyTheme(currentTheme);

    // Language Switcher (RU / EN)
    function applyLanguage(lang) {
        if (!I18N[lang]) lang = 'ru';
        currentLang = lang;
        localStorage.setItem('zeph_lang', lang);

        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (I18N[lang][key]) {
                el.textContent = I18N[lang][key];
            }
        });

        langBtns.forEach(b => {
            b.classList.toggle('active', b.dataset.lang === lang);
        });

        // Update active view title & subtitle
        if (currentView === 'menu') {
            pageTitle.textContent = t('menu_title');
            pageSubtitle.textContent = t('menu_sub');
        } else if (currentView === 'auth') {
            pageTitle.textContent = t('auth_title');
            pageSubtitle.textContent = t('auth_sub');
        } else if (currentView === 'map') {
            pageTitle.textContent = t('map_title');
            pageSubtitle.textContent = t('map_sub');
        } else if (currentView === 'settings') {
            pageTitle.textContent = t('settings_title');
            pageSubtitle.textContent = t('settings_sub');
        } else if (currentView === 'profile') {
            pageTitle.textContent = t('profile_title');
            pageSubtitle.textContent = t('profile_sub');
        } else if (currentView === 'placeholder') {
            pageTitle.textContent = t('shop_title');
            pageSubtitle.textContent = t('shop_sub');
            placeholderTitle.textContent = t('shop_placeholder_title');
            placeholderDesc.textContent = t('shop_placeholder_desc');
        }
    }

    langBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            triggerHaptic('selection');
            applyLanguage(btn.dataset.lang);
        });
    });

    applyLanguage(currentLang);

    // Toggle Login Notifications
    if (settingLoginNotify) {
        settingLoginNotify.checked = localStorage.getItem('zeph_setting_notify') !== 'false';
        settingLoginNotify.addEventListener('change', () => {
            localStorage.setItem('zeph_setting_notify', settingLoginNotify.checked);
            triggerHaptic('selection');
        });
    }

    // Toggle Animated Background Particles
    if (settingParticles) {
        settingParticles.checked = particlesActive;
        settingParticles.addEventListener('change', () => {
            particlesActive = settingParticles.checked;
            localStorage.setItem('zeph_setting_particles', particlesActive);
            triggerHaptic('selection');
            if (particlesActive) {
                canvas.style.display = 'block';
                animateParticles();
            } else {
                canvas.style.display = 'none';
                if (particleAnimFrame) cancelAnimationFrame(particleAnimFrame);
            }
        });
    }

    // Toggle Haptic
    if (settingHaptic) {
        settingHaptic.checked = isHapticEnabled;
        settingHaptic.addEventListener('change', () => {
            isHapticEnabled = settingHaptic.checked;
            localStorage.setItem('zeph_setting_haptic', isHapticEnabled);
            if (isHapticEnabled) triggerHaptic('selection');
        });
    }

    // Clear cache & hard reload
    if (btnClearCacheReload) {
        btnClearCacheReload.addEventListener('click', () => {
            triggerHaptic('success');
            const newUrl = window.location.origin + window.location.pathname + '?v=' + Date.now();
            window.location.href = newUrl;
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
        switchView('menu');
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
