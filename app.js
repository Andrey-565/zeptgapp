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
    const menuBtnDiscord = document.getElementById('menuBtnDiscord');
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
    const btnPastePin = document.getElementById('btnPastePin');
    const btnClearPin = document.getElementById('btnClearPin');
    const pinErrorMsg = document.getElementById('pinErrorMsg');
    const pinErrorText = document.getElementById('pinErrorText');

    // Profile elements
    const profileIpAlertCard = document.getElementById('profileIpAlertCard');
    const profileAlertNick = document.getElementById('profileAlertNick');
    const profileAlertIp = document.getElementById('profileAlertIp');
    const profileAlertCode = document.getElementById('profileAlertCode');
    const btnProfileApproveIp = document.getElementById('btnProfileApproveIp');
    const btnProfileRejectIp = document.getElementById('btnProfileRejectIp');

    const profileUserAvatar = document.getElementById('profileUserAvatar');
    const profileMcNick = document.getElementById('profileMcNick');
    const badgeNickLinked = document.getElementById('badgeNickLinked');
    const profileTgUser = document.getElementById('profileTgUser');
    const profileUserId = document.getElementById('profileUserId');
    const profileTrustedIp = document.getElementById('profileTrustedIp');
    const profileAuthStatus = document.getElementById('profileAuthStatus');
    const profileUnlinkedCard = document.getElementById('profileUnlinkedCard');
    const btnProfileGoLink = document.getElementById('btnProfileGoLink');
    const profileZephyrs = document.getElementById('profileZephyrs');
    const statMinedBlocks = document.getElementById('statMinedBlocks');
    const statMobKills = document.getElementById('statMobKills');
    const statDeaths = document.getElementById('statDeaths');

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
            btn_back: "← В главное меню",
            profile_zephyrs_title: "Баланс Зефирок",
            profile_zephyrs_badge: "Игровая валюта",
            profile_stats_title: "Игровая статистика",
            stat_mined: "Блоков добыто",
            stat_kills: "Убийств мобов",
            stat_deaths: "Смертей",
            menu_discord_title: "Discord Сервер",
            menu_discord_desc: "Новости, общение с игроками, тикеты и голосовые каналы"
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
            btn_back: "← To Main Menu",
            profile_zephyrs_title: "Zephyrs Balance",
            profile_zephyrs_badge: "Game Currency",
            profile_stats_title: "Game Statistics",
            stat_mined: "Blocks Mined",
            stat_kills: "Mob Kills",
            stat_deaths: "Deaths",
            menu_discord_title: "Discord Server",
            menu_discord_desc: "News, community chat, support tickets & voice channels"
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

    if (menuBtnDiscord) {
        menuBtnDiscord.addEventListener('click', () => {
            triggerHaptic('medium');
            const discordLink = CONFIG.discordUrl || 'https://discord.gg/X9fPgGjATk';
            if (tg?.openLink) {
                tg.openLink(discordLink);
            } else {
                window.open(discordLink, '_blank');
            }
        });
    }

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
    // 6b. Settings & Theme Handlers
    // ----------------------------------------------------
    const settingLoginNotify = document.getElementById('settingLoginNotify');
    const settingParticles = document.getElementById('settingParticles');
    const settingHaptic = document.getElementById('settingHaptic');
    const btnClearCacheReload = document.getElementById('btnClearCacheReload');
    const langBtns = document.querySelectorAll('.lang-btn');
    const btnThemeDark = document.getElementById('btnThemeDark');
    const btnThemeLight = document.getElementById('btnThemeLight');

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
    // 7. Profile Initialization & IP Approval Logic
    // ----------------------------------------------------
    function initProfileData() {
        const tgUser = tg?.initDataUnsafe?.user;
        const tgId = tgUser?.id || 0;
        const tgUsername = tgUser?.username || '';
        const tgDisplayName = tgUser ? [tgUser.first_name, tgUser.last_name].filter(Boolean).join(' ') : 'Игрок';

        if (profileTgUser) {
            profileTgUser.textContent = tgUsername ? '@' + tgUsername : tgDisplayName;
        }
        if (profileUserId) {
            profileUserId.textContent = tgId ? `ID: ${tgId}` : 'ID: —';
        }

        let savedNick = localStorage.getItem('zeph_linked_nick') || sessionNick || '';
        let savedIp = localStorage.getItem('zeph_trusted_ip') || '';

        // Read stats & zephyrs from URL if present
        const urlZephyrs = urlParams.get('zephyrs');
        const urlDeaths = urlParams.get('deaths');
        const urlMined = urlParams.get('mined');
        const urlKills = urlParams.get('kills');
        if (urlZephyrs !== null) localStorage.setItem('zeph_balance_zephyrs', urlZephyrs);
        if (urlDeaths !== null) localStorage.setItem('zeph_stat_deaths', urlDeaths);
        if (urlMined !== null) localStorage.setItem('zeph_stat_mined', urlMined);
        if (urlKills !== null) localStorage.setItem('zeph_stat_kills', urlKills);

        // If opened with IP change session
        const isIpChangeParam = urlParams.get('isIpChange') === 'true' || urlParams.get('tab') === 'profile';
        if (sessionIp && (isIpChangeParam || sessionCode)) {
            showProfileIpAlert(sessionNick || savedNick, sessionIp, sessionCode);
        }

        updateProfileUI(savedNick, savedIp);

        // Fetch profile from backend API if available
        const apiUrl = CONFIG.apiUrl || (window.location.hostname === 'localhost' ? 'http://localhost:8088' : '');
        if (apiUrl && (tgId || savedNick)) {
            fetch(`${apiUrl}/api/profile?tg_id=${tgId}&nick=${encodeURIComponent(savedNick)}`)
                .then(r => r.json())
                .then(data => {
                    if (data.linked) {
                        localStorage.setItem('zeph_linked_nick', data.nick);
                        if (data.trustedIp) localStorage.setItem('zeph_trusted_ip', data.trustedIp);
                        updateProfileUI(data.nick, data.trustedIp, data.stats, data.zephyrs);
                    }
                    if (data.pendingSession && data.pendingSession.isIpChange) {
                        showProfileIpAlert(data.pendingSession.player, data.pendingSession.ip, data.pendingSession.code);
                    }
                })
                .catch(() => {});
        }
    }

    function updateProfileUI(nick, trustedIp, stats, zephyrs) {
        if (zephyrs !== undefined && zephyrs !== null) {
            localStorage.setItem('zeph_balance_zephyrs', zephyrs);
        }
        if (stats) {
            if (stats.deaths !== undefined) localStorage.setItem('zeph_stat_deaths', stats.deaths);
            if (stats.minedBlocks !== undefined) localStorage.setItem('zeph_stat_mined', stats.minedBlocks);
            else if (stats.mined !== undefined) localStorage.setItem('zeph_stat_mined', stats.mined);
            if (stats.mobKills !== undefined) localStorage.setItem('zeph_stat_kills', stats.mobKills);
            else if (stats.kills !== undefined) localStorage.setItem('zeph_stat_kills', stats.kills);
        }

        const currentZephyrs = Number(localStorage.getItem('zeph_balance_zephyrs') || 0);
        const currentDeaths = Number(localStorage.getItem('zeph_stat_deaths') || 0);
        const currentMined = Number(localStorage.getItem('zeph_stat_mined') || 0);
        const currentKills = Number(localStorage.getItem('zeph_stat_kills') || 0);

        if (profileZephyrs) profileZephyrs.textContent = currentZephyrs.toLocaleString('ru-RU');
        if (statDeaths) statDeaths.textContent = currentDeaths.toLocaleString('ru-RU');
        if (statMinedBlocks) statMinedBlocks.textContent = currentMined.toLocaleString('ru-RU');
        if (statMobKills) statMobKills.textContent = currentKills.toLocaleString('ru-RU');

        if (nick) {
            if (profileMcNick) profileMcNick.textContent = nick;
            if (profileUserAvatar) profileUserAvatar.src = `https://mc-heads.net/avatar/${encodeURIComponent(nick)}/120`;
            if (badgeNickLinked) {
                badgeNickLinked.style.display = 'inline-block';
                badgeNickLinked.textContent = '✔ Привязан';
            }
            if (profileTrustedIp) profileTrustedIp.textContent = trustedIp || 'Защищён (текущий IP)';
            if (profileAuthStatus) profileAuthStatus.textContent = 'Вход без пароля';
            if (profileUnlinkedCard) profileUnlinkedCard.style.display = 'none';
        } else {
            if (profileMcNick) profileMcNick.textContent = 'Не привязан';
            if (profileUserAvatar) profileUserAvatar.src = 'https://mc-heads.net/avatar/Steve/120';
            if (badgeNickLinked) badgeNickLinked.style.display = 'none';
            if (profileTrustedIp) profileTrustedIp.textContent = 'Не установлен';
            if (profileAuthStatus) profileAuthStatus.textContent = 'Требуется привязка';
            if (profileUnlinkedCard) profileUnlinkedCard.style.display = 'block';
        }
    }

    function showProfileIpAlert(nick, ip, code) {
        if (!profileIpAlertCard) return;
        profileIpAlertCard.style.display = 'block';
        if (profileAlertNick) profileAlertNick.textContent = nick || 'Игрок';
        if (profileAlertIp) profileAlertIp.textContent = ip || '0.0.0.0';
        if (profileAlertCode) profileAlertCode.textContent = code || '------';

        // Also display alert banner on Menu
        if (activeSessionBanner) {
            activeSessionBanner.style.display = 'flex';
            bannerCode.textContent = code || 'IP ALERT';
        }
    }

    if (btnProfileApproveIp) {
        btnProfileApproveIp.addEventListener('click', () => {
            triggerHaptic('medium');
            const code = profileAlertCode ? profileAlertCode.textContent.trim() : sessionCode;
            const newIp = profileAlertIp ? profileAlertIp.textContent.trim() : '';
            const nick = profileAlertNick ? profileAlertNick.textContent.trim() : '';

            btnProfileApproveIp.disabled = true;
            btnProfileApproveIp.textContent = 'Подтверждение...';

            submitVerification(code);

            if (newIp) {
                localStorage.setItem('zeph_trusted_ip', newIp);
                if (profileTrustedIp) profileTrustedIp.textContent = newIp;
            }
            if (nick) {
                localStorage.setItem('zeph_linked_nick', nick);
                updateProfileUI(nick, newIp);
            }

            profileIpAlertCard.innerHTML = `
                <div style="text-align: center; padding: 12px 6px;">
                    <div style="font-size: 28px; margin-bottom: 6px;">✔</div>
                    <h3 style="color: #34d399; margin-bottom: 4px;">Вход успешно подтверждён!</h3>
                    <p style="font-size: 12px; color: var(--text-muted); margin: 0;">Доступ к серверу разблокирован. Приятной игры!</p>
                </div>
            `;
            profileIpAlertCard.style.borderColor = 'rgba(16, 185, 129, 0.6)';
            profileIpAlertCard.style.animation = 'none';
        });
    }

    if (btnProfileRejectIp) {
        btnProfileRejectIp.addEventListener('click', () => {
            if (!confirm("Вы уверены, что хотите отклонить вход? Игрок будет отключён от сервера.")) return;
            triggerHaptic('warning');
            const code = profileAlertCode ? profileAlertCode.textContent.trim() : sessionCode;
            rejectSession(code);
            if (profileIpAlertCard) profileIpAlertCard.style.display = 'none';
        });
    }

    if (btnProfileGoLink) {
        btnProfileGoLink.addEventListener('click', () => {
            switchView('auth');
        });
    }

    initProfileData();

    // ----------------------------------------------------
    // 8. Redesigned PIN Code Inputs
    // ----------------------------------------------------
    function setupPinInputs() {
        const boxes = Array.from(document.querySelectorAll('.pin-box'));
        if (boxes.length === 0) return;

        function fillCode(digits) {
            digits = String(digits).replace(/\D/g, '').slice(0, 6);
            boxes.forEach((box, i) => {
                box.value = digits[i] || '';
                if (box.value) {
                    box.classList.add('filled');
                } else {
                    box.classList.remove('filled');
                }
            });
            const firstEmpty = boxes.find(b => !b.value);
            if (firstEmpty) {
                firstEmpty.focus();
            } else if (boxes[5]) {
                boxes[5].focus();
            }
            checkPin();
        }

        boxes.forEach((box, index) => {
            box.value = '';
            box.addEventListener('input', (e) => {
                if (pinErrorMsg) pinErrorMsg.style.display = 'none';
                boxes.forEach(b => b.classList.remove('error'));
                const val = e.target.value.replace(/[^0-9]/g, '');
                if (val.length > 1) {
                    fillCode(val);
                    return;
                }
                box.value = val;
                if (val) {
                    box.classList.add('filled');
                    triggerHaptic('light');
                    if (index < boxes.length - 1) {
                        boxes[index + 1].focus();
                    }
                } else {
                    box.classList.remove('filled');
                }
                checkPin();
            });

            box.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace') {
                    if (!box.value && index > 0) {
                        boxes[index - 1].focus();
                        boxes[index - 1].value = '';
                        boxes[index - 1].classList.remove('filled');
                        checkPin();
                    } else {
                        box.classList.remove('filled');
                    }
                } else if (e.key === 'ArrowLeft' && index > 0) {
                    boxes[index - 1].focus();
                } else if (e.key === 'ArrowRight' && index < boxes.length - 1) {
                    boxes[index + 1].focus();
                }
            });

            box.addEventListener('paste', (e) => {
                e.preventDefault();
                const text = (e.clipboardData || window.clipboardData).getData('text');
                fillCode(text);
                triggerHaptic('selection');
            });
        });

        if (btnPastePin) {
            btnPastePin.addEventListener('click', async () => {
                triggerHaptic('light');
                try {
                    const text = await navigator.clipboard.readText();
                    if (text) {
                        fillCode(text);
                    }
                } catch (err) {
                    const manualPaste = prompt('Вставьте 6-значный код:');
                    if (manualPaste) fillCode(manualPaste);
                }
            });
        }

        if (btnClearPin) {
            btnClearPin.addEventListener('click', () => {
                triggerHaptic('light');
                fillCode('');
                if (boxes[0]) boxes[0].focus();
            });
        }
    }

    function checkPin() {
        const boxes = Array.from(document.querySelectorAll('.pin-box'));
        let pin = '';
        boxes.forEach(b => pin += b.value);
        if (btnManualSubmit) {
            btnManualSubmit.disabled = (pin.length !== 6);
        }
    }

    if (btnManualSubmit) {
        btnManualSubmit.addEventListener('click', () => {
            const boxes = Array.from(document.querySelectorAll('.pin-box'));
            let pin = '';
            boxes.forEach(b => pin += b.value);
            if (pin.length === 6) {
                if (sessionCodeBadge) sessionCodeBadge.textContent = pin;
                submitVerification(pin);
            }
        });
    }

    // ----------------------------------------------------
    // 9. Session Routing & Submission Logic
    // ----------------------------------------------------
    const targetTab = urlParams.get('tab');
    if (targetTab === 'profile') {
        switchView('profile');
    } else if (sessionCode && sessionCode.trim().length > 0) {
        const cleanCode = sessionCode.trim();
        const isIpChangeParam = urlParams.get('isIpChange') === 'true' || urlParams.get('ip');

        if (isIpChangeParam) {
            showProfileIpAlert(sessionNick, sessionIp, cleanCode);
            switchView('profile');
        } else {
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
        }
    } else {
        authConfirmBox.style.display = 'none';
        authManualBox.style.display = 'block';
        setupPinInputs();
        switchView('menu');
    }

    btnConfirm.addEventListener('click', () => {
        submitVerification(sessionCodeBadge.textContent);
    });

    btnReject.addEventListener('click', () => {
        if (!confirm("Вы уверены, что хотите отклонить вход?")) return;
        triggerHaptic('warning');
        const currentCode = sessionCodeBadge.textContent;
        rejectSession(currentCode);
    });

    function showPinError(message) {
        triggerHaptic('error');
        if (pinErrorMsg && pinErrorText) {
            pinErrorText.textContent = message || "Неверный код авторизации! Код не найден на сервере.";
            pinErrorMsg.style.display = 'flex';
        }
        const boxes = document.querySelectorAll('.pin-box');
        boxes.forEach(b => {
            b.classList.add('error');
        });
        if (btnManualSubmit) {
            btnManualSubmit.disabled = false;
            btnManualSubmit.innerHTML = '<span class="btn-icon">🔗</span> Подтвердить по коду';
        }
        if (btnConfirm) {
            btnConfirm.disabled = false;
            btnConfirm.innerHTML = '<span class="btn-icon">🎮</span> Подтвердить вход';
        }
    }

    async function submitVerification(targetCode) {
        if (!targetCode || targetCode.length !== 6) {
            showPinError("Код должен состоять из 6 цифр!");
            return;
        }

        if (btnConfirm) {
            btnConfirm.disabled = true;
            btnConfirm.textContent = "Проверка...";
        }
        if (btnManualSubmit) {
            btnManualSubmit.disabled = true;
            btnManualSubmit.textContent = "Проверка...";
        }
        triggerHaptic('medium');

        // Check if sessionCode was in URL
        const hasSessionUrl = sessionCode && sessionCode.trim().length === 6;
        if (hasSessionUrl && targetCode !== sessionCode.trim()) {
            showPinError("Неверный код! Код не совпадает с активной сессией на сервере.");
            return;
        }

        const tgUser = tg?.initDataUnsafe?.user;
        const tgId = tgUser?.id || 0;
        const tgUsername = tgUser?.username || '';

        // Check API URL if available
        const apiUrl = CONFIG.apiUrl || (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? `${window.location.protocol}//${window.location.hostname}:8088` : '');

        if (apiUrl) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 3500);

                const response = await fetch(`${apiUrl}/api/verify`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    signal: controller.signal,
                    body: JSON.stringify({
                        code: targetCode,
                        telegram_id: tgId,
                        username: tgUsername
                    })
                });
                clearTimeout(timeoutId);

                const data = await response.json();
                if (data.success) {
                    const linkedNick = data.player || sessionNick;
                    const trustedIp = data.trustedIp || sessionIp;
                    if (linkedNick) {
                        localStorage.setItem('zeph_linked_nick', linkedNick);
                        updateProfileUI(linkedNick, trustedIp, data.stats, data.zephyrs);
                    }
                    triggerHaptic('success');
                    switchView('success');
                    return;
                } else {
                    // API explicitly returned error / code not found!
                    showPinError(data.error || "Неверный код авторизации! Код не найден на сервере.");
                    return;
                }
            } catch (err) {
                console.warn('API verify failed or unreachable:', err);
            }
        }

        // If not verified via API:
        // Scenario A: Opened via verified session link (code was in URL and matches)
        if (hasSessionUrl && targetCode === sessionCode.trim()) {
            let sent = false;
            try {
                if (tg?.sendData) {
                    tg.sendData(JSON.stringify({
                        action: "auth",
                        code: targetCode,
                        telegram_id: tgId,
                        username: tgUsername
                    }));
                    sent = true;
                }
            } catch (_) {}

            const botLink = `https://t.me/${CONFIG.botUsername}?start=auth_${targetCode}`;
            if (!sent && CONFIG.botUsername) {
                if (tg?.openTelegramLink) {
                    tg.openTelegramLink(botLink);
                } else {
                    window.location.href = botLink;
                }
            }

            if (sessionNick) {
                localStorage.setItem('zeph_linked_nick', sessionNick);
                updateProfileUI(sessionNick, sessionIp);
            }

            triggerHaptic('success');
            switchView('success');
            return;
        }

        // Scenario B: Code entered manually and API is not reachable
        // Forward code to Bot for authoritative validation - DO NOT blindly show success!
        let sentData = false;
        try {
            if (tg?.sendData) {
                tg.sendData(JSON.stringify({
                    action: "auth",
                    code: targetCode,
                    telegram_id: tgId,
                    username: tgUsername
                }));
                sentData = true;
            }
        } catch (_) {}

        const botLink = `https://t.me/${CONFIG.botUsername}?start=auth_${targetCode}`;
        if (!sentData && CONFIG.botUsername) {
            if (tg?.openTelegramLink) {
                tg.openTelegramLink(botLink);
            } else {
                window.location.href = botLink;
            }
        }

        // Show pending notice card directing user to Telegram bot chat
        if (authManualBox) {
            authManualBox.innerHTML = `
                <div class="pending-notice-card">
                    <div class="pending-notice-icon">⏳</div>
                    <h3>Код отправлен боту</h3>
                    <p>Код <code>${targetCode}</code> отправлен боту <strong>@${CONFIG.botUsername}</strong> для проверки.</p>
                    <p style="color: #94a3b8; font-size: 13px; margin: 12px 0;">Если код верный, бот подтвердит авторизацию на сервере. Проверьте результат в диалоге с ботом!</p>
                    <button class="btn btn-primary btn-block" onclick="window.location.reload()">
                        Ввести другой код
                    </button>
                </div>
            `;
        }
    }

    function rejectSession(targetCode) {
        let sent = false;
        try {
            if (tg?.sendData) {
                tg.sendData(JSON.stringify({ action: "reject", code: targetCode }));
                sent = true;
            }
        } catch (_) {}

        const apiUrl = CONFIG.apiUrl || (window.location.hostname === 'localhost' ? 'http://localhost:8088' : '');
        if (apiUrl) {
            fetch(`${apiUrl}/api/reject`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: targetCode })
            }).catch(() => {});
        }

        const rejectLink = `https://t.me/${CONFIG.botUsername}?start=reject_${targetCode}`;
        if (!sent && CONFIG.botUsername) {
            if (tg?.openTelegramLink) {
                tg.openTelegramLink(rejectLink);
            } else {
                window.location.href = rejectLink;
            }
        }

        switchView('error');
    }

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
