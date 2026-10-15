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
    let isSoundEnabled = localStorage.getItem('zeph_setting_sound') === 'true';
    let audioCtx = null;

    function playClickSound(freq = 900, duration = 0.035) {
        if (!isSoundEnabled) return;
        try {
            if (!audioCtx) {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                if (AudioContext) audioCtx = new AudioContext();
            }
            if (audioCtx && audioCtx.state === 'suspended') {
                audioCtx.resume();
            }
            if (audioCtx) {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(freq * 1.4, audioCtx.currentTime + duration);
                gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.start();
                osc.stop(audioCtx.currentTime + duration);
            }
        } catch (_) {}
    }

    // Apply Compact Mode on load if enabled
    if (localStorage.getItem('zeph_setting_compact') === 'true') {
        document.body.classList.add('compact-mode');
    }

    function triggerHaptic(type = 'light') {
        playClickSound(type === 'medium' ? 750 : (type === 'error' ? 350 : (type === 'success' ? 1100 : 920)));
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
    const serverNameEl = document.getElementById('serverName');
    if (serverNameEl && window.CONFIG && CONFIG.serverName) {
        serverNameEl.textContent = CONFIG.serverName;
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
        info: document.getElementById('infoView'),
        placeholder: document.getElementById('placeholderView'),
        success: document.getElementById('successView'),
        error: document.getElementById('errorView')
    };

    const pageTitle = document.getElementById('pageTitle');
    const pageSubtitle = document.getElementById('pageSubtitle');

    // Menu Cards
    const menuBtnAuth = document.getElementById('menuBtnAuth');
    const menuBtnMap = document.getElementById('menuBtnMap');
    const menuBtnDiscord = document.getElementById('menuBtnDiscord');
    const menuBtnInfo = document.getElementById('menuBtnInfo');
    const btnOpenInfoFromQuick = document.getElementById('btnOpenInfoFromQuick');
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
    const zephyrsBalanceCard = document.getElementById('zephyrsBalanceCard');
    const statMinedBlocks = document.getElementById('statMinedBlocks');
    const statMobKills = document.getElementById('statMobKills');
    const statDeaths = document.getElementById('statDeaths');
    const statKdRatio = document.getElementById('statKdRatio');
    const statPlayTime = document.getElementById('statPlayTime');
    const statAchievements = document.getElementById('statAchievements');
    const profileJoinDate = document.getElementById('profileJoinDate');
    const profileOnlineStatus = document.getElementById('profileOnlineStatus');
    const btnCopyNick = document.getElementById('btnCopyNick');
    const btnRefreshProfile = document.getElementById('btnRefreshProfile');
    const badgePlayerRank = document.getElementById('badgePlayerRank');

    // New Settings elements
    const settingSoundFx = document.getElementById('settingSoundFx');
    const settingCompact = document.getElementById('settingCompact');
    const settingHideBalance = document.getElementById('settingHideBalance');
    const settingConfirmReject = document.getElementById('settingConfirmReject');
    const settingAutoRefresh = document.getElementById('settingAutoRefresh');

    // BlueMap Elements
    const btnLaunchMapDirect = document.getElementById('btnLaunchMapDirect');
    const btnCopyMapLink = document.getElementById('btnCopyMapLink');
    const mapCopyToast = document.getElementById('mapCopyToast');

    // Placeholder Elements
    const placeholderIcon = document.getElementById('placeholderIcon');
    const placeholderTitle = document.getElementById('placeholderTitle');
    const placeholderDesc = document.getElementById('placeholderDesc');

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
            // General & Dock
            dock_home: "Главная",
            dock_shop: "Магазин",
            dock_settings: "Настройки",
            dock_profile: "Профиль",
            coming_soon: "Скоро в обновлении сервера",
            btn_back: "← В главное меню",
            btn_close_app: "Закрыть окно",
            btn_to_menu: "В главное меню",

            // Menu View
            menu_title: "Главное меню",
            menu_sub: "Выберите нужный раздел",
            banner_pending: "Ожидает подтверждения",
            banner_code_label: "Код сессии:",
            banner_login_btn: "Войти",
            menu_auth_title: "Авторизация",
            menu_auth_badge: "Запрос",
            menu_auth_desc: "Подтвердить вход на сервер или ввести 6-значный PIN-код",
            menu_map_title: "Карта сервера",
            menu_map_desc: "Интерактивная 3D карта основного мира в реальном времени",
            menu_discord_title: "Discord Сервер",
            menu_discord_desc: "Новости, общение с игроками, тикеты и голосовые каналы",
            menu_info_title: "О сервере и крафты",
            menu_info_desc: "Уникальные механики, кастомные крафты, напитки BreweryX",

            // Auth View
            auth_title: "Авторизация",
            auth_sub: "Подтверждение игровой сессии",
            auth_confirm_pill: "Подтверждение сессии",
            auth_session_code: "🔑 Код сессии:",
            auth_ip_label: "🌐 IP-адрес:",
            auth_confirm_btn: "Подтвердить вход",
            auth_reject_btn: "Это не я (Отклонить)",
            auth_manual_title: "Ввод кода авторизации",
            auth_manual_hint: "Введите 6-значный код с экрана Minecraft сервера:",
            auth_paste_btn: "Вставить из буфера",
            auth_clear_btn: "Очистить",
            auth_submit_btn: "Подтвердить по коду",
            auth_error_not_found: "Неверный код авторизации! Код не найден на сервере.",
            auth_error_6digits: "Код должен состоять из 6 цифр!",
            auth_error_mismatch: "Неверный код! Код не совпадает с активной сессией на сервере.",
            auth_error_conn: "Ошибка соединения с сервером! Проверьте интернет и повторите попытку.",
            auth_checking: "Проверка...",
            auth_confirm_reject_prompt: "Вы уверены, что хотите отклонить вход?",

            // Map View
            map_title: "Карта сервера",
            map_sub: "Интерактивная 3D карта",
            map_expand_btn: "Развернуть 3D мир",
            map_h2: "Глобальная карта сервера",
            map_p: "Полная 3D визуализация мира из плагина BlueMap с постройками, биомами и игроками в реальном времени.",
            map_feat1: "Высокая детализация блоков",
            map_feat2: "Обзор 360°, приближение и 3D",
            map_feat3: "Маркеры игроков онлайн",
            map_launch_btn: "Открыть 3D карту в браузере",
            map_copy_btn: "📋 Скопировать ссылку на карту",
            map_copied_toast: "✔ Ссылка на карту скопирована!",

            // Settings View
            settings_title: "Настройки",
            settings_sub: "Параметры и оформление",
            settings_sec_notify: "Уведомления и Звук",
            settings_notify_title: "Уведомления о входе",
            settings_notify_desc: "Сообщение в боте при успешной авторизации",
            settings_sound_title: "Звуки интерфейса",
            settings_sound_desc: "Звуковой отклик при кликах и действиях",
            settings_sec_interface: "Интерфейс и Эффекты",
            settings_theme_title: "Тема оформления",
            settings_theme_desc: "Переключение тёмного и светлого стиля",
            theme_dark: "Тёмная",
            theme_light: "Светлая",
            settings_particles_title: "Анимированный фон",
            settings_particles_desc: "Плавающие частицы и свечение",
            settings_haptic_title: "Тактильный отклик (Haptic)",
            settings_haptic_desc: "Вибрация при кликах и переключении меню",
            settings_compact_title: "Компактный режим",
            settings_compact_desc: "Уменьшенные карточки и отступы",
            settings_hide_balance_title: "Скрыть баланс валюты",
            settings_hide_balance_desc: "Скрывать сумму (••••) для приватности",
            settings_sec_security: "Безопасность и Сессии",
            settings_confirm_reject_title: "Подтверждение отклонения",
            settings_confirm_reject_desc: "Запрос подтверждения перед отменой сессии",
            settings_auto_refresh_title: "Авто-обновление профиля",
            settings_auto_refresh_desc: "Автоматическое фоновое обновление статистики",
            settings_sec_system: "Система и Язык",
            settings_lang_title: "Язык приложения",
            settings_lang_desc: "Язык интерфейса Mini App",
            settings_version_title: "Версия приложения",
            settings_reload_btn: "🔄 Сбросить кэш и перезагрузить",

            // Shop / Placeholder
            shop_title: "Магазин",
            shop_sub: "Игровые привилегии и бонусы",
            shop_placeholder_title: "Магазин и Донат",
            shop_placeholder_desc: "Раздел игрового магазина и донат-привилегий скоро станет доступен!",

            // Profile View
            profile_title: "Профиль",
            profile_sub: "Данные вашего аккаунта",
            profile_alert_ip_title: "Вход с нового IP-адреса",
            profile_alert_ip_subtitle: "Обнаружена новая попытка входа",
            profile_alert_nick_label: "👤 Никнейм:",
            profile_alert_newip_label: "🌐 Новый IP:",
            profile_alert_code_label: "🔑 Код сессии:",
            profile_alert_approve_btn: "Подтвердить вход",
            profile_alert_reject_btn: "Отклонить (Не я)",
            profile_alert_approving: "Подтверждение...",
            profile_alert_success_title: "Вход успешно подтверждён!",
            profile_alert_success_desc: "Доступ к серверу разблокирован. Приятной игры!",
            profile_alert_reject_prompt: "Вы уверены, что хотите отклонить вход? Игрок будет отключён от сервера.",
            profile_nick_linked: "✔ Привязан",
            profile_nick_unlinked: "Не привязан",
            badge_player_rank: "⭐ Игрок",
            profile_trusted_ip_label: "Доверенный IP",
            profile_trusted_ip_active: "Защищён (текущий IP)",
            profile_trusted_ip_none: "Не установлен",
            profile_auth_status_label: "Статус входа",
            profile_auth_status_active: "Вход без пароля",
            profile_auth_status_req: "Требуется привязка",
            profile_join_date_label: "На сервере с",
            profile_online_status_label: "Статус сети",
            profile_status_online: "В сети",
            profile_status_offline: "Офлайн",
            profile_nick_copied: "✔ Никнейм скопирован!",
            profile_refreshing: "Обновление...",
            profile_zephyrs_title: "Баланс Зефирок",
            profile_zephyrs_badge: "Игровая валюта",
            profile_stats_title: "Игровая статистика",
            stat_mined: "Блоков добыто",
            stat_kills: "Убийств мобов",
            stat_deaths: "Смертей",
            stat_kd: "K/D Рейтинг",
            stat_playtime: "Время в игре",
            stat_achievements: "Достижения",
            profile_unlinked_title: "Minecraft аккаунт не привязан",
            profile_unlinked_desc: "Зайдите на сервер Minecraft, скопируйте 6-значный код и подтвердите привязку.",
            profile_unlinked_btn: "Ввести код привязки",

            // Zephyrs Banking (Tinkoff Style)
            bank_title: "Zephyrius Банкинг",
            bank_subtitle: "История операций и выписка",
            bank_card_label: "Счёт в Зефирках",
            bank_income_label: "Доходы",
            bank_expense_label: "Расходы",
            bank_filter_all: "Все",
            bank_filter_income: "Пополнения",
            bank_filter_expense: "Списания",
            bank_no_tx: "Нет операций",
            bank_empty_title: "Операций пока нет",
            bank_empty_desc: "Здесь будут отображаться ваши доходы, награды и покупки на сервере.",

            // Info View & Badges
            info_title: "О сервере и крафты",
            info_sub: "Механики и кастомные рецепты",
            info_tab_features: "Механики",
            info_tab_crafts: "Крафты",
            info_tab_brewery: "Напитки",
            badge_security: "Безопасность",
            badge_event: "Событие",
            badge_event_short: "Ивент",
            badge_economy: "Экономика",
            badge_rpg: "RPG",
            badge_dungeons: "Данжи",
            badge_comfort: "Комфорт",
            badge_workbench: "Верстак 3x3",
            badge_anvil: "Наковальня",
            badge_action: "Действие",
            badge_non_alcoholic: "Безалкогольный",
            badge_energy: "Бодрость",
            badge_strong: "Крепкий",
            badge_legendary: "Легендарный",
            badge_exquisite: "Изысканное",

            // Info Mechanics
            feat_tgauth_title: "Беспарольный вход (TgAuth)",
            feat_tgauth_desc: "Никаких паролей в чате игры! Вход на сервер подтверждается в 1 клик через это Mini App. Доверенный IP запоминается автоматически — повторный ввод не требуется.",
            tag_1click: "1-Click Login",
            tag_ip_protect: "Защита по IP",
            tag_anti_hack: "Защита от взлома",

            feat_bm_title: "Кровавая Луна (BloodMoon)",
            feat_bm_desc: "Наступает раз в 12–15 игровых дней и длится 10 минут. Ночь окрашивается в багровый цвет, спавн мобов возрастает в 3 раза, появляются опасные заряженные криперы! Защитите базу или сразитесь за топ в турнире выживания.",
            tag_spawn3x: "Спавн x3",
            tag_charged_creepers: "Charged Creepers",
            tag_bm_tournament: "Турнир и награды",
            tag_bm_duration: "Длительность 10 мин",

            feat_met_title: "Падение Метеоритов",
            feat_met_desc: "Каждые 5 часов в радиусе 1000 блоков падает метеорит с грохотом и огненным следом. В месте падения образуется кратер с лавой, а в самом сердце скрыто ядро из глубинной алмазной руды!",
            tag_met_interval: "Каждые 5 часов",
            tag_met_crater: "Кратер с лавой",
            tag_met_diamond: "Алмазное ядро",
            tag_met_radius: "Радиус 1000 бл",

            feat_iron_title: "Баланс Железа (IronTweaks)",
            feat_iron_desc: "Экономика сбалансирована: из обычной железной руды выпадают самородки (1–4 шт). Из железных големов дропается 4–9 самородков вместо целых слитков. Железо сохраняет ценность на всех этапах выживания.",
            tag_iron_ore: "1-4 самородка с руды",
            tag_iron_golem: "Анти-фермы големов",
            tag_iron_balance: "Реалистичный баланс",

            feat_lm_title: "Уровневые Мобы (LevelledMobs)",
            feat_lm_desc: "Чем дальше вы исследуете мир от спавна и чем глубже спускаетесь под землю, тем выше уровень мобов. Сильные монстры наносят больше урона, но дают больше ценного лута и опыта.",
            tag_lm_scaling: "Растущая сложность",
            tag_lm_xp: "Увеличенный XP",
            tag_lm_loot: "Редкий лут",

            feat_vault_title: "Сброс Vaults (VaultReset)",
            feat_vault_desc: "Испытательные хранилища и спавнеры в Trial Chambers обновляются каждые 3 часа. Над каждым сундуком парит голографический таймер до следующего открытия ключом.",
            tag_vault_cd: "Кулдаун 3 часа",
            tag_vault_holo: "Голограмма с таймером",
            tag_vault_dungeons: "Бесконечные данжи",

            feat_atm_title: "Атмосфера и Детали",
            feat_atm_desc: "Голосовой чат Plasmo Voice (клавиша V), реалистичная анимация призыва железного голема, возможность сидеть на ступеньках и ковриках (ПКМ или /sit), и интерактивная 3D карта BlueMap.",
            tag_sit: "/sit на ступеньках",
            tag_golem_anim: "Анимация голема",

            // Info Crafts
            craft_core_title: "Ядро Дровосека",
            craft_core_desc: "Легендарное магическое ядро, концентрирующее силу древнего леса. Используется для создания Топора Дровосека на наковальне.",
            craft_core_legend: "Ингредиенты: 4x Алмаз, 4x Незеритовый слиток, 1x Звезда Незера (в центре).",

            craft_axe_title: "Топор Дровосека",
            craft_axe_desc: "Позволяет срубить все дерево целиком за 1 удар! Мгновенно разрушает ствол и всю листву (до 500 блоков за раз).",
            craft_axe_cost_label: "Стоимость:",
            craft_axe_cost_val: "40 уровней опыта на наковальне.",
            craft_axe_feat_label: "Возможности:",
            craft_axe_feat_val: "Срубает до 500 блоков дерева + сбрасывает листву. Включение/выключение: Shift + ПКМ или /lj toggle.",

            craft_frame_title: "Невидимая Рамка",
            craft_frame_desc: "Сделайте рамку с предметом полностью невидимой, чтобы предмет выглядел лежащим на блоке или парящим у стены.",
            craft_frame_action: "Shift + ПКМ ножницами",
            craft_frame_legend: "Повесьте рамку, поместите в неё предмет. Возьмите в руку Ножницы, зажмите Shift и нажмите ПКМ по рамке!",

            // Info Brewery
            brew_guide_notice: "⚗️ Как варить: Бросьте ингредиенты в кипящий котел с водой, подождите время варки, наберите в колбы, при необходимости перегоните в зельеварке со светопылью и выдержите в нужной деревянной бочке!",
            drink_choc_title: "Горячий Шоколад",
            drink_choc_step1: "Котел (3 мин): 3x Молоко, 4x Какао-бобы",
            drink_choc_step2: "Выдержка: Не требуется (пить свежим)",
            drink_choc_effect: "⚡ Спешка I (Haste) на 2 мин + Скорость I",

            drink_coffee_title: "Ледяной Кофе",
            drink_coffee_step1: "Котел (4 мин): 3x Какао-бобы, 2x Сахар, 1x Плотный лёд",
            drink_coffee_step2: "Перегонка: Не требуется",
            drink_coffee_effect: "✨ Снимает похмелье + Регенерация I",

            drink_whiskey_title: "Пылающий Виски",
            drink_whiskey_badge: "Крепкий (35%)",
            drink_whiskey_step1: "Котел (10 мин): 6x Пшеница, 2x Огненный порошок, 1x Сгусток магмы",
            drink_whiskey_step2: "Перегонка: 2 раза в зельеварке",
            drink_whiskey_step3: "Бочка: Акация (выдержка 3 года)",
            drink_whiskey_effect: "🛡️ Огнестойкость на 5 мин + Сила II",

            drink_vodka_title: "Светящаяся Грибная Водка",
            drink_vodka_badge: "Крепкий (40%)",
            drink_vodka_step1: "Котел (8 мин): 8x Картофель, 3x Светящийся мох, 2x Светящиеся ягоды",
            drink_vodka_step2: "Перегонка: 3 раза",
            drink_vodka_step3: "Бочка: Берёза (выдержка 2 года)",
            drink_vodka_effect: "👁️ Ночное зрение на 10 мин + Свечение",

            drink_mead_title: "Золотая Медовуха",
            drink_mead_badge: "Легендарный",
            drink_mead_step1: "Котел (6 мин): 5x Бутылочка мёда, 2x Тростник, 1x Золотое яблоко",
            drink_mead_step2: "Бочка: Дуб (выдержка 4 года)",
            drink_mead_effect: "💛 Поглощение сердец (Golden Hearts) + Насыщение",

            drink_wine_title: "Благородное Красное Вино",
            drink_wine_badge: "Изысканное (15%)",
            drink_wine_step1: "Котел (5 мин): 8x Сладкие ягоды, 2x Сахар",
            drink_wine_step2: "Бочка: Тёмный дуб (выдержка 5 лет)",
            drink_wine_effect: "❤️ Регенерация II на 1.5 мин + Снятие дебаффов",

            // Result Views
            success_title: "Вход подтверждён!",
            success_desc: "Сервер перенаправляет вас в основной мир. Приятной игры!",
            success_tip: "✨ Аккаунт успешно привязан к вашему Telegram!",
            btn_success_profile: "👤 Открыть профиль",
            error_title: "Вход отклонён",
            error_desc: "Сессия аннулирована."
        },
        en: {
            // General & Dock
            dock_home: "Home",
            dock_shop: "Store",
            dock_settings: "Settings",
            dock_profile: "Profile",
            coming_soon: "Coming in server update",
            btn_back: "← To Main Menu",
            btn_close_app: "Close Window",
            btn_to_menu: "To Main Menu",

            // Menu View
            menu_title: "Main Menu",
            menu_sub: "Select a section",
            banner_pending: "Pending confirmation",
            banner_code_label: "Session code:",
            banner_login_btn: "Login",
            menu_auth_title: "Authorization",
            menu_auth_badge: "Request",
            menu_auth_desc: "Confirm server login or enter 6-digit PIN",
            menu_map_title: "Server Map",
            menu_map_desc: "Real-time interactive 3D map of the main world",
            menu_discord_title: "Discord Server",
            menu_discord_desc: "News, community chat, support tickets & voice channels",
            menu_info_title: "Server Info & Crafts",
            menu_info_desc: "Unique mechanics, custom crafts, BreweryX beverages",

            // Auth View
            auth_title: "Authorization",
            auth_sub: "Game session confirmation",
            auth_confirm_pill: "Session Confirmation",
            auth_session_code: "🔑 Session Code:",
            auth_ip_label: "🌐 IP Address:",
            auth_confirm_btn: "Confirm Login",
            auth_reject_btn: "Not Me (Reject)",
            auth_manual_title: "Enter Authorization Code",
            auth_manual_hint: "Enter the 6-digit code from your Minecraft screen:",
            auth_paste_btn: "Paste from Clipboard",
            auth_clear_btn: "Clear",
            auth_submit_btn: "Confirm with Code",
            auth_error_not_found: "Invalid code! Code not found on the server.",
            auth_error_6digits: "Code must be 6 digits!",
            auth_error_mismatch: "Incorrect code! Code does not match the active session.",
            auth_error_conn: "Server connection error! Check your connection and try again.",
            auth_checking: "Checking...",
            auth_confirm_reject_prompt: "Are you sure you want to reject this login?",

            // Map View
            map_title: "Server Map",
            map_sub: "Interactive 3D map",
            map_expand_btn: "Expand 3D World",
            map_h2: "Global Server Map",
            map_p: "Full 3D visualization of the world from BlueMap plugin with builds, biomes and real-time players.",
            map_feat1: "High block detail",
            map_feat2: "360° view, zoom and 3D",
            map_feat3: "Online player markers",
            map_launch_btn: "Open 3D Map in Browser",
            map_copy_btn: "📋 Copy Map Link",
            map_copied_toast: "✔ Map link copied!",

            // Settings View
            settings_title: "Settings",
            settings_sub: "Preferences & appearance",
            settings_sec_notify: "Notifications & Sound",
            settings_notify_title: "Login Notifications",
            settings_notify_desc: "Receive bot message upon successful login",
            settings_sound_title: "Sound Effects",
            settings_sound_desc: "Audio feedback on taps and actions",
            settings_sec_interface: "Interface & Effects",
            settings_theme_title: "Appearance Theme",
            settings_theme_desc: "Toggle between dark and light styles",
            theme_dark: "Dark",
            theme_light: "Light",
            settings_particles_title: "Animated Background",
            settings_particles_desc: "Floating particles and glows",
            settings_haptic_title: "Haptic Feedback",
            settings_haptic_desc: "Vibration on button clicks and tab switching",
            settings_compact_title: "Compact Mode",
            settings_compact_desc: "Tighter spacing and compact cards",
            settings_hide_balance_title: "Hide Zephyrs Balance",
            settings_hide_balance_desc: "Display •••• for privacy and streaming",
            settings_sec_security: "Security & Sessions",
            settings_confirm_reject_title: "Confirm on Reject",
            settings_confirm_reject_desc: "Prevents accidental session rejection",
            settings_auto_refresh_title: "Auto-Refresh Data",
            settings_auto_refresh_desc: "Periodically re-sync profile & stats",
            settings_sec_system: "System & Language",
            settings_lang_title: "App Language",
            settings_lang_desc: "Language of Mini App interface",
            settings_version_title: "App Version",
            settings_reload_btn: "🔄 Reset Cache & Reload",

            // Shop / Placeholder
            shop_title: "Store",
            shop_sub: "In-game ranks and perks",
            shop_placeholder_title: "Store & Donations",
            shop_placeholder_desc: "In-game store and donate privileges will be available soon!",

            // Profile View
            profile_title: "Profile",
            profile_sub: "Your account details",
            profile_alert_ip_title: "Login from New IP Address",
            profile_alert_ip_subtitle: "New login attempt detected",
            profile_alert_nick_label: "👤 Nickname:",
            profile_alert_newip_label: "🌐 New IP:",
            profile_alert_code_label: "🔑 Session Code:",
            profile_alert_approve_btn: "Approve Login",
            profile_alert_reject_btn: "Reject (Not Me)",
            profile_alert_approving: "Approving...",
            profile_alert_success_title: "Login successfully approved!",
            profile_alert_success_desc: "Server access unlocked. Enjoy playing!",
            profile_alert_reject_prompt: "Are you sure you want to reject? The player will be disconnected.",
            profile_nick_linked: "✔ Linked",
            profile_nick_unlinked: "Not Linked",
            badge_player_rank: "⭐ Player",
            profile_trusted_ip_label: "Trusted IP",
            profile_trusted_ip_active: "Protected (Current IP)",
            profile_trusted_ip_none: "Not Set",
            profile_auth_status_label: "Login Status",
            profile_auth_status_active: "Passwordless Login",
            profile_auth_status_req: "Linking Required",
            profile_join_date_label: "Member since",
            profile_online_status_label: "Online Status",
            profile_status_online: "Online",
            profile_status_offline: "Offline",
            profile_nick_copied: "✔ Nickname copied!",
            profile_refreshing: "Refreshing...",
            profile_zephyrs_title: "Zephyrs Balance",
            profile_zephyrs_badge: "Game Currency",
            profile_stats_title: "Game Statistics",
            stat_mined: "Blocks Mined",
            stat_kills: "Mob Kills",
            stat_deaths: "Deaths",
            stat_kd: "K/D Ratio",
            stat_playtime: "Playtime",
            stat_achievements: "Advancements",
            profile_unlinked_title: "Minecraft Account Not Linked",
            profile_unlinked_desc: "Join the Minecraft server, copy the 6-digit code, and confirm linking.",
            profile_unlinked_btn: "Enter Linking Code",

            // Zephyrs Banking (Tinkoff Style)
            bank_title: "Zephyrius Banking",
            bank_subtitle: "Transaction history & statement",
            bank_card_label: "Zephyrs Account",
            bank_income_label: "Income",
            bank_expense_label: "Expenses",
            bank_filter_all: "All",
            bank_filter_income: "Income",
            bank_filter_expense: "Expenses",
            bank_no_tx: "No transactions",
            bank_empty_title: "No transactions yet",
            bank_empty_desc: "Your income, rewards, and server purchases will appear here.",

            // Info View & Badges
            info_title: "Server Info & Crafts",
            info_sub: "Mechanics and custom recipes",
            info_tab_features: "Mechanics",
            info_tab_crafts: "Crafts",
            info_tab_brewery: "Beverages",
            badge_security: "Security",
            badge_event: "Event",
            badge_event_short: "Event",
            badge_economy: "Economy",
            badge_rpg: "RPG",
            badge_dungeons: "Dungeons",
            badge_comfort: "Quality of Life",
            badge_workbench: "Workbench 3x3",
            badge_anvil: "Anvil",
            badge_action: "Action",
            badge_non_alcoholic: "Non-Alcoholic",
            badge_energy: "Vigor",
            badge_strong: "Strong",
            badge_legendary: "Legendary",
            badge_exquisite: "Exquisite",

            // Info Mechanics
            feat_tgauth_title: "Passwordless Login (TgAuth)",
            feat_tgauth_desc: "No passwords in game chat! Server login is confirmed in 1 click via this Mini App. Trusted IP is remembered automatically — no repeated inputs needed.",
            tag_1click: "1-Click Login",
            tag_ip_protect: "IP Protection",
            tag_anti_hack: "Anti-Hack Defense",

            feat_bm_title: "Blood Moon (BloodMoon)",
            feat_bm_desc: "Occurs every 12–15 in-game days and lasts 10 minutes. The night turns crimson, mob spawns increase 3x, and dangerous charged creepers appear! Protect your base or fight for the top in the survival tournament.",
            tag_spawn3x: "Spawn x3",
            tag_charged_creepers: "Charged Creepers",
            tag_bm_tournament: "Tournament & Rewards",
            tag_bm_duration: "Duration: 10 min",

            feat_met_title: "Meteorite Strikes",
            feat_met_desc: "Every 5 hours within a 1000-block radius, a meteorite falls with thunderous sound and fire trail. A lava crater forms, with a deepslate diamond ore core hidden at its heart!",
            tag_met_interval: "Every 5 Hours",
            tag_met_crater: "Lava Crater",
            tag_met_diamond: "Diamond Core",
            tag_met_radius: "Radius: 1000 Blocks",

            feat_iron_title: "Iron Balance (IronTweaks)",
            feat_iron_desc: "Balanced economy: regular iron ore drops nuggets (1–4 pcs). Iron golems drop 4–9 nuggets instead of whole ingots. Iron remains valuable at all survival stages.",
            tag_iron_ore: "1-4 nuggets per ore",
            tag_iron_golem: "Golem farm nerf",
            tag_iron_balance: "Realistic balance",

            feat_lm_title: "Levelled Mobs (LevelledMobs)",
            feat_lm_desc: "The further you explore from spawn and the deeper underground you go, the higher the mob levels. Stronger monsters deal more damage but grant better loot and XP.",
            tag_lm_scaling: "Scaling Difficulty",
            tag_lm_xp: "Bonus XP",
            tag_lm_loot: "Rare Loot",

            feat_vault_title: "Vault Reset (VaultReset)",
            feat_vault_desc: "Trial Vaults and spawners in Trial Chambers reset every 3 hours. A holographic countdown timer floats above each chest.",
            tag_vault_cd: "Cooldown: 3 Hours",
            tag_vault_holo: "Hologram Timer",
            tag_vault_dungeons: "Endless Dungeons",

            feat_atm_title: "Atmosphere & Details",
            feat_atm_desc: "Plasmo Voice chat (V key), realistic iron golem build animation, sitting on stairs and carpets (RMB or /sit), and interactive 3D BlueMap.",
            tag_sit: "/sit on stairs",
            tag_golem_anim: "Golem animation",

            // Info Crafts
            craft_core_title: "Lumberjack Core",
            craft_core_desc: "Legendary magical core concentrating ancient forest power. Used to craft the Lumberjack Axe on an anvil.",
            craft_core_legend: "Ingredients: 4x Diamond, 4x Netherite Ingot, 1x Nether Star (center).",

            craft_axe_title: "Lumberjack Axe",
            craft_axe_desc: "Fells the entire tree in a single strike! Instantly breaks logs and leaves (up to 500 blocks at once).",
            craft_axe_cost_label: "Cost:",
            craft_axe_cost_val: "40 XP levels on an anvil.",
            craft_axe_feat_label: "Features:",
            craft_axe_feat_val: "Fells up to 500 blocks of logs + leaves. Toggle on/off: Shift + RMB or /lj toggle.",

            craft_frame_title: "Invisible Item Frame",
            craft_frame_desc: "Make the item frame invisible so the item appears resting on a surface or floating on a wall.",
            craft_frame_action: "Shift + RMB with shears",
            craft_frame_legend: "Place the frame, insert an item. Hold Shears in hand, crouch (Shift) and Right-Click the frame!",

            // Info Brewery
            brew_guide_notice: "⚗️ Brewing Guide: Drop ingredients into a boiling water cauldron, wait brewing time, collect in bottles, distill in brewing stand if needed, and age in wooden barrels!",
            drink_choc_title: "Hot Chocolate",
            drink_choc_step1: "Cauldron (3 min): 3x Milk, 4x Cocoa Beans",
            drink_choc_step2: "Aging: None (drink fresh)",
            drink_choc_effect: "⚡ Haste I (2 min) + Speed I",

            drink_coffee_title: "Iced Coffee",
            drink_coffee_step1: "Cauldron (4 min): 3x Cocoa Beans, 2x Sugar, 1x Packed Ice",
            drink_coffee_step2: "Distillation: Not required",
            drink_coffee_effect: "✨ Cures Hangover + Regeneration I",

            drink_whiskey_title: "Blazing Whiskey",
            drink_whiskey_badge: "Strong (35%)",
            drink_whiskey_step1: "Cauldron (10 min): 6x Wheat, 2x Blaze Powder, 1x Magma Cream",
            drink_whiskey_step2: "Distillation: 2x in brewing stand",
            drink_whiskey_step3: "Barrel: Acacia (age 3 years)",
            drink_whiskey_effect: "🛡️ Fire Resistance (5 min) + Strength II",

            drink_vodka_title: "Glowing Mushroom Vodka",
            drink_vodka_badge: "Strong (40%)",
            drink_vodka_step1: "Cauldron (8 min): 8x Potato, 3x Glow Lichen, 2x Glow Berries",
            drink_vodka_step2: "Distillation: 3x in brewing stand",
            drink_vodka_step3: "Barrel: Birch (age 2 years)",
            drink_vodka_effect: "👁️ Night Vision (10 min) + Glowing",

            drink_mead_title: "Golden Mead",
            drink_mead_badge: "Legendary",
            drink_mead_step1: "Cauldron (6 min): 5x Honey Bottle, 2x Sugar Cane, 1x Golden Apple",
            drink_mead_step2: "Barrel: Oak (age 4 years)",
            drink_mead_effect: "💛 Absorption Hearts + Saturation",

            drink_wine_title: "Noble Red Wine",
            drink_wine_badge: "Exquisite (15%)",
            drink_wine_step1: "Cauldron (5 min): 8x Sweet Berries, 2x Sugar",
            drink_wine_step2: "Barrel: Dark Oak (age 5 years)",
            drink_wine_effect: "❤️ Regeneration II (1.5 min) + Cleanses Debuffs",

            // Result Views
            success_title: "Login Confirmed!",
            success_desc: "The server is routing you into the main world. Have fun!",
            success_tip: "✨ Account successfully linked to your Telegram!",
            btn_success_profile: "👤 Open Profile",
            error_title: "Login Rejected",
            error_desc: "Session invalidated."
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

        // Header
        if (targetView === 'menu') {
            if (pageTitle) pageTitle.textContent = t('menu_title');
            if (pageSubtitle) pageSubtitle.textContent = t('menu_sub');
            if (tg?.BackButton) tg.BackButton.hide();
            setActiveDockTab('home');
        } else {
            if (tg?.BackButton) tg.BackButton.show();

            switch (targetView) {
                case 'auth':
                    if (pageTitle) pageTitle.textContent = t('auth_title');
                    if (pageSubtitle) pageSubtitle.textContent = t('auth_sub');
                    break;
                case 'map':
                    if (pageTitle) pageTitle.textContent = t('map_title');
                    if (pageSubtitle) pageSubtitle.textContent = t('map_sub');
                    break;
                case 'settings':
                    if (pageTitle) pageTitle.textContent = t('settings_title');
                    if (pageSubtitle) pageSubtitle.textContent = t('settings_sub');
                    setActiveDockTab('settings');
                    break;
                case 'profile':
                    if (pageTitle) pageTitle.textContent = t('profile_title');
                    if (pageSubtitle) pageSubtitle.textContent = t('profile_sub');
                    setActiveDockTab('profile');
                    initProfileData();
                    break;
                case 'info':
                    if (pageTitle) pageTitle.textContent = t('info_title');
                    if (pageSubtitle) pageSubtitle.textContent = t('info_sub');
                    break;
            }
        }
    }

    if (tg?.BackButton) {
        tg.BackButton.onClick(() => switchView('menu'));
    }

    if (menuBtnAuth) {
        menuBtnAuth.addEventListener('click', () => switchView('auth'));
    }
    if (menuBtnMap) {
        menuBtnMap.addEventListener('click', () => switchView('map'));
    }
    if (menuBtnInfo) {
        menuBtnInfo.addEventListener('click', () => {
            triggerHaptic('medium');
            switchView('info');
        });
    }
    if (btnOpenInfoFromQuick) {
        btnOpenInfoFromQuick.addEventListener('click', () => {
            triggerHaptic('medium');
            switchView('info');
        });
    }

    // Info tab switching (Механики / Крафты / Напитки)
    const infoTabBtns = document.querySelectorAll('.info-tab-btn');
    const infoTabFeatures = document.getElementById('infoTabFeatures');
    const infoTabCrafts = document.getElementById('infoTabCrafts');
    const infoTabBrewery = document.getElementById('infoTabBrewery');

    infoTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            triggerHaptic('selection');
            infoTabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const targetTab = btn.dataset.infotab;
            if (infoTabFeatures) infoTabFeatures.style.display = targetTab === 'features' ? 'block' : 'none';
            if (infoTabCrafts) infoTabCrafts.style.display = targetTab === 'crafts' ? 'block' : 'none';
            if (infoTabBrewery) infoTabBrewery.style.display = targetTab === 'brewery' ? 'block' : 'none';
        });
    });

    if (menuBtnDiscord) {
        menuBtnDiscord.addEventListener('click', () => {
            triggerHaptic('medium');
            const discordLink = (window.CONFIG && CONFIG.discordUrl) ? CONFIG.discordUrl : 'https://discord.gg/X9fPgGjATk';
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

    // Backward-compatibility listeners for older cached views
    const btnBackToMenu = document.getElementById('btnBackToMenu');
    if (btnBackToMenu) {
        btnBackToMenu.addEventListener('click', () => switchView('menu'));
    }
    const btnProfileBack = document.getElementById('btnProfileBack');
    if (btnProfileBack) {
        btnProfileBack.addEventListener('click', () => switchView('menu'));
    }
    const btnPlaceholderBack = document.getElementById('btnPlaceholderBack');
    if (btnPlaceholderBack) {
        btnPlaceholderBack.addEventListener('click', () => switchView('menu'));
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
            if (pageTitle) pageTitle.textContent = t('menu_title');
            if (pageSubtitle) pageSubtitle.textContent = t('menu_sub');
        } else if (currentView === 'auth') {
            if (pageTitle) pageTitle.textContent = t('auth_title');
            if (pageSubtitle) pageSubtitle.textContent = t('auth_sub');
        } else if (currentView === 'map') {
            if (pageTitle) pageTitle.textContent = t('map_title');
            if (pageSubtitle) pageSubtitle.textContent = t('map_sub');
        } else if (currentView === 'settings') {
            if (pageTitle) pageTitle.textContent = t('settings_title');
            if (pageSubtitle) pageSubtitle.textContent = t('settings_sub');
        } else if (currentView === 'profile') {
            if (pageTitle) pageTitle.textContent = t('profile_title');
            if (pageSubtitle) pageSubtitle.textContent = t('profile_sub');
        } else if (currentView === 'info') {
            if (pageTitle) pageTitle.textContent = t('info_title');
            if (pageSubtitle) pageSubtitle.textContent = t('info_sub');
        } else if (currentView === 'placeholder') {
            if (pageTitle) pageTitle.textContent = t('shop_title');
            if (pageSubtitle) pageSubtitle.textContent = t('shop_sub');
            if (placeholderTitle) placeholderTitle.textContent = t('shop_placeholder_title');
            if (placeholderDesc) placeholderDesc.textContent = t('shop_placeholder_desc');
        }

        // Update Dock Tab Titles
        dockTabs.forEach(tab => {
            const tabKey = tab.dataset.tab;
            if (tabKey === 'home') tab.title = t('dock_home');
            else if (tabKey === 'shop') tab.title = t('dock_shop');
            else if (tabKey === 'settings') tab.title = t('dock_settings');
            else if (tabKey === 'profile') tab.title = t('dock_profile');
        });

        // Re-render localized profile strings
        const savedNick = localStorage.getItem('zeph_linked_nick') || sessionNick || '';
        const savedIp = localStorage.getItem('zeph_trusted_ip') || '';
        updateProfileUI(savedNick, savedIp);
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

    // Toggle Sound FX
    if (settingSoundFx) {
        settingSoundFx.checked = isSoundEnabled;
        settingSoundFx.addEventListener('change', () => {
            isSoundEnabled = settingSoundFx.checked;
            localStorage.setItem('zeph_setting_sound', isSoundEnabled);
            triggerHaptic('selection');
        });
    }

    // Toggle Compact Mode
    if (settingCompact) {
        settingCompact.checked = localStorage.getItem('zeph_setting_compact') === 'true';
        settingCompact.addEventListener('change', () => {
            const enabled = settingCompact.checked;
            localStorage.setItem('zeph_setting_compact', enabled);
            if (enabled) {
                document.body.classList.add('compact-mode');
            } else {
                document.body.classList.remove('compact-mode');
            }
            triggerHaptic('selection');
        });
    }

    // Toggle Hide Balance
    if (settingHideBalance) {
        settingHideBalance.checked = localStorage.getItem('zeph_setting_hide_balance') === 'true';
        settingHideBalance.addEventListener('change', () => {
            localStorage.setItem('zeph_setting_hide_balance', settingHideBalance.checked);
            window.zephPeekBalance = false;
            triggerHaptic('selection');
            const savedNick = localStorage.getItem('zeph_linked_nick') || sessionNick || '';
            const savedIp = localStorage.getItem('zeph_trusted_ip') || '';
            updateProfileUI(savedNick, savedIp);
        });
    }

    // Toggle Confirm Reject
    if (settingConfirmReject) {
        settingConfirmReject.checked = localStorage.getItem('zeph_setting_confirm_reject') !== 'false';
        settingConfirmReject.addEventListener('change', () => {
            localStorage.setItem('zeph_setting_confirm_reject', settingConfirmReject.checked);
            triggerHaptic('selection');
        });
    }

    // Toggle Auto Refresh
    let autoRefreshInterval = null;
    function setupAutoRefreshTimer() {
        if (autoRefreshInterval) clearInterval(autoRefreshInterval);
        const isAuto = localStorage.getItem('zeph_setting_auto_refresh') === 'true';
        if (isAuto) {
            autoRefreshInterval = setInterval(() => {
                if (currentView === 'profile' && !document.hidden) {
                    initProfileData();
                }
            }, 20000);
        }
    }

    if (settingAutoRefresh) {
        settingAutoRefresh.checked = localStorage.getItem('zeph_setting_auto_refresh') === 'true';
        settingAutoRefresh.addEventListener('change', () => {
            localStorage.setItem('zeph_setting_auto_refresh', settingAutoRefresh.checked);
            triggerHaptic('selection');
            setupAutoRefreshTimer();
        });
    }
    setupAutoRefreshTimer();

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
        let tgId = tgUser?.id || 0;
        let tgUsername = tgUser?.username || '';
        let tgDisplayName = tgUser ? [tgUser.first_name, tgUser.last_name].filter(Boolean).join(' ') : '';

        if (tgId) {
            localStorage.setItem('zeph_tg_id', tgId);
        } else {
            tgId = Number(localStorage.getItem('zeph_tg_id') || 0);
        }

        if (tgUsername) {
            localStorage.setItem('zeph_tg_username', tgUsername);
        } else {
            tgUsername = localStorage.getItem('zeph_tg_username') || '';
        }

        if (!tgDisplayName && tgUsername) tgDisplayName = '@' + tgUsername;
        if (!tgDisplayName) tgDisplayName = 'Игрок';

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
            fetch(`${apiUrl}/api/profile?tg_id=${tgId}&nick=${encodeURIComponent(savedNick)}`, {
                headers: { 'Bypass-Tunnel-Reminder': '1' }
            })
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

    window.zephPeekBalance = false;

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

        // Zephyrs Balance (with privacy mode support)
        const isHideBalance = localStorage.getItem('zeph_setting_hide_balance') === 'true';
        if (profileZephyrs) {
            if (isHideBalance && !window.zephPeekBalance) {
                profileZephyrs.textContent = '••••';
            } else {
                profileZephyrs.textContent = currentZephyrs.toLocaleString(currentLang === 'ru' ? 'ru-RU' : 'en-US');
            }
        }

        // Stats: Deaths, Mined, Kills
        if (statDeaths) statDeaths.textContent = currentDeaths.toLocaleString('ru-RU');
        if (statMinedBlocks) statMinedBlocks.textContent = currentMined.toLocaleString('ru-RU');
        if (statMobKills) statMobKills.textContent = currentKills.toLocaleString('ru-RU');

        // Stats: K/D Ratio
        const kdRatio = currentDeaths > 0 ? (currentKills / currentDeaths).toFixed(2) : currentKills.toFixed(2);
        if (statKdRatio) statKdRatio.textContent = kdRatio;

        // Stats: Playtime
        let savedPlaytimeMinutes = Number(localStorage.getItem('zeph_stat_playtime') || 0);
        if (savedPlaytimeMinutes <= 0 && currentMined > 0) {
            savedPlaytimeMinutes = Math.max(25, Math.floor(currentMined / 15 + currentKills * 2));
            localStorage.setItem('zeph_stat_playtime', savedPlaytimeMinutes);
        }
        if (statPlayTime) {
            const hours = Math.floor(savedPlaytimeMinutes / 60);
            const mins = savedPlaytimeMinutes % 60;
            statPlayTime.textContent = currentLang === 'ru' 
                ? (hours > 0 ? `${hours}ч ${mins}м` : `${mins}м`)
                : (hours > 0 ? `${hours}h ${mins}m` : `${mins}m`);
        }

        // Stats: Achievements
        let savedAchieve = Number(localStorage.getItem('zeph_stat_achieve') || 0);
        if (savedAchieve <= 0 && currentMined > 0) {
            savedAchieve = Math.min(80, Math.floor(Math.sqrt(currentMined)) + 2);
            localStorage.setItem('zeph_stat_achieve', savedAchieve);
        }
        if (statAchievements) statAchievements.textContent = savedAchieve.toString();

        // Registration Date
        let regTimestamp = Number(localStorage.getItem('zeph_registered_at') || 0);
        if (!regTimestamp) {
            regTimestamp = 1728800000000;
            localStorage.setItem('zeph_registered_at', regTimestamp);
        }
        if (profileJoinDate) {
            const dateObj = new Date(regTimestamp);
            profileJoinDate.textContent = dateObj.toLocaleDateString(currentLang === 'ru' ? 'ru-RU' : 'en-US', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });
        }

        // Player Rank Badge
        if (badgePlayerRank) {
            badgePlayerRank.textContent = t('badge_player_rank');
        }

        if (nick) {
            if (profileMcNick) profileMcNick.textContent = nick;
            if (profileUserAvatar) profileUserAvatar.src = `https://mc-heads.net/avatar/${encodeURIComponent(nick)}/120`;
            if (badgeNickLinked) {
                badgeNickLinked.style.display = 'inline-block';
                badgeNickLinked.textContent = t('profile_nick_linked');
            }
            if (profileTrustedIp) profileTrustedIp.textContent = trustedIp || t('profile_trusted_ip_active');
            if (profileAuthStatus) profileAuthStatus.textContent = t('profile_auth_status_active');
            if (profileOnlineStatus) {
                profileOnlineStatus.textContent = t('profile_status_online');
                profileOnlineStatus.classList.add('text-emerald');
            }
            if (profileUnlinkedCard) profileUnlinkedCard.style.display = 'none';
        } else {
            if (profileMcNick) profileMcNick.textContent = t('profile_nick_unlinked');
            if (profileUserAvatar) profileUserAvatar.src = 'https://mc-heads.net/avatar/Steve/120';
            if (badgeNickLinked) badgeNickLinked.style.display = 'none';
            if (profileTrustedIp) profileTrustedIp.textContent = t('profile_trusted_ip_none');
            if (profileAuthStatus) profileAuthStatus.textContent = t('profile_auth_status_req');
            if (profileOnlineStatus) {
                profileOnlineStatus.textContent = t('profile_status_offline');
                profileOnlineStatus.classList.remove('text-emerald');
            }
            if (profileUnlinkedCard) profileUnlinkedCard.style.display = 'block';
        }
    }

    // ================= ZEPHYRS BANKING (TINKOFF STYLE FULLSCREEN) =================
    const BANK_TRANSACTIONS = [];

    const bankSheetOverlay = document.getElementById('bankSheetOverlay');
    const btnCloseBankSheet = document.getElementById('btnCloseBankSheet');
    const bankSheetBalance = document.getElementById('bankSheetBalance');
    const bankTotalIncome = document.getElementById('bankTotalIncome');
    const bankTotalExpense = document.getElementById('bankTotalExpense');
    const bankTransactionsList = document.getElementById('bankTransactionsList');
    const bankFilterTabBtns = document.querySelectorAll('.bank-tab-btn');

    let currentBankFilter = 'all';

    function renderBankSheet(filter = 'all') {
        currentBankFilter = filter;
        const currentZephyrs = Number(localStorage.getItem('zeph_balance_zephyrs') || 0);
        if (bankSheetBalance) {
            bankSheetBalance.textContent = currentZephyrs.toLocaleString(currentLang === 'ru' ? 'ru-RU' : 'en-US');
        }

        const totalInc = BANK_TRANSACTIONS.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
        const totalExp = BANK_TRANSACTIONS.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

        if (bankTotalIncome) bankTotalIncome.textContent = '+' + totalInc.toLocaleString('ru-RU') + ' 🍡';
        if (bankTotalExpense) bankTotalExpense.textContent = '-' + totalExp.toLocaleString('ru-RU') + ' 🍡';

        if (bankFilterTabBtns) {
            bankFilterTabBtns.forEach(btn => {
                btn.classList.toggle('active', btn.dataset.filter === filter);
            });
        }

        if (!bankTransactionsList) return;
        const filtered = filter === 'all' ? BANK_TRANSACTIONS : BANK_TRANSACTIONS.filter(t => t.type === filter);

        if (filtered.length === 0) {
            bankTransactionsList.innerHTML = `
                <div class="bank-empty-state">
                    <div class="bank-empty-icon-wrap">
                        <span>🧾</span>
                    </div>
                    <h4 class="bank-empty-title">${t('bank_empty_title')}</h4>
                    <p class="bank-empty-desc">${t('bank_empty_desc')}</p>
                </div>
            `;
            return;
        }

        bankTransactionsList.innerHTML = filtered.map(tx => `
            <div class="bank-tx-item" data-id="${tx.id}">
                <div class="bank-tx-left">
                    <div class="bank-tx-icon-wrap">${tx.icon}</div>
                    <div class="bank-tx-info">
                        <span class="bank-tx-title">${currentLang === 'ru' ? tx.titleRu : tx.titleEn}</span>
                        <span class="bank-tx-desc">${currentLang === 'ru' ? tx.catRu : tx.catEn}</span>
                    </div>
                </div>
                <div class="bank-tx-right">
                    <span class="bank-tx-amount ${tx.type}">${tx.type === 'income' ? '+' : '-'}${tx.amount} 🍡</span>
                    <span class="bank-tx-time">${currentLang === 'ru' ? tx.dateRu : tx.dateEn}</span>
                </div>
            </div>
        `).join('');
    }

    function openBankSheet() {
        if (!bankSheetOverlay) return;
        renderBankSheet(currentBankFilter || 'all');
        bankSheetOverlay.style.display = 'flex';
        try {
            if (tg?.BackButton) {
                tg.BackButton.show();
                tg.BackButton.onClick(closeBankSheet);
            }
        } catch (_) {}
    }

    function closeBankSheet() {
        triggerHaptic('light');
        if (bankSheetOverlay) bankSheetOverlay.style.display = 'none';
        try {
            if (tg?.BackButton) {
                tg.BackButton.hide();
                tg.BackButton.offClick(closeBankSheet);
            }
        } catch (_) {}
    }

    // Open Tinkoff Zephyrs Banking screen on balance card click
    if (zephyrsBalanceCard) {
        zephyrsBalanceCard.addEventListener('click', () => {
            triggerHaptic('medium');
            openBankSheet();
        });
    }

    if (btnCloseBankSheet) btnCloseBankSheet.addEventListener('click', closeBankSheet);

    if (bankFilterTabBtns) {
        bankFilterTabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                triggerHaptic('selection');
                renderBankSheet(btn.dataset.filter || 'all');
            });
        });
    }

    // Copy Nickname Button
    if (btnCopyNick) {
        btnCopyNick.addEventListener('click', async () => {
            triggerHaptic('medium');
            const currentNick = (profileMcNick ? profileMcNick.textContent.trim() : '') || 'Steve';
            try {
                await navigator.clipboard.writeText(currentNick);
            } catch (_) {}
            btnCopyNick.textContent = '✔';
            setTimeout(() => { btnCopyNick.textContent = '📋'; }, 1500);
        });
    }

    // Refresh Profile Button
    if (btnRefreshProfile) {
        btnRefreshProfile.addEventListener('click', () => {
            triggerHaptic('medium');
            btnRefreshProfile.style.transform = 'rotate(360deg)';
            btnRefreshProfile.style.transition = 'transform 0.5s ease';
            setTimeout(() => {
                btnRefreshProfile.style.transform = 'none';
                btnRefreshProfile.style.transition = '';
            }, 550);
            initProfileData();
        });
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
            btnProfileApproveIp.textContent = t('profile_alert_approving');

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
                    <h3 style="color: #34d399; margin-bottom: 4px;">${t('profile_alert_success_title')}</h3>
                    <p style="font-size: 12px; color: var(--text-muted); margin: 0;">${t('profile_alert_success_desc')}</p>
                </div>
            `;
            profileIpAlertCard.style.borderColor = 'rgba(16, 185, 129, 0.6)';
            profileIpAlertCard.style.animation = 'none';
        });
    }

    if (btnProfileRejectIp) {
        btnProfileRejectIp.addEventListener('click', () => {
            const needConfirm = localStorage.getItem('zeph_setting_confirm_reject') !== 'false';
            if (needConfirm && !confirm(t('profile_alert_reject_prompt'))) return;
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
            if (activeSessionBanner) activeSessionBanner.style.display = 'flex';
            if (bannerCode) bannerCode.textContent = cleanCode;
            if (authBadge) authBadge.style.display = 'inline-block';

            if (authConfirmBox) authConfirmBox.style.display = 'block';
            if (authManualBox) authManualBox.style.display = 'none';
            if (sessionCodeBadge) sessionCodeBadge.textContent = cleanCode;

            if (sessionNick) {
                if (playerName) playerName.textContent = sessionNick;
                if (playerAvatar) playerAvatar.src = `https://mc-heads.net/avatar/${encodeURIComponent(sessionNick)}/120`;
            }
            if (sessionIp) {
                if (playerIp) playerIp.textContent = sessionIp;
                if (ipRow) ipRow.style.display = 'flex';
            }

            switchView('auth');
        }
    } else {
        if (authConfirmBox) authConfirmBox.style.display = 'none';
        if (authManualBox) authManualBox.style.display = 'block';
        setupPinInputs();
        switchView('menu');
    }

    if (btnConfirm) {
        btnConfirm.addEventListener('click', () => {
            const code = sessionCodeBadge ? sessionCodeBadge.textContent.trim() : '';
            submitVerification(code);
        });
    }

    if (btnReject) {
        btnReject.addEventListener('click', () => {
            const needConfirm = localStorage.getItem('zeph_setting_confirm_reject') !== 'false';
            if (needConfirm && !confirm(t('auth_confirm_reject_prompt'))) return;
            triggerHaptic('warning');
            const currentCode = sessionCodeBadge ? sessionCodeBadge.textContent.trim() : '';
            rejectSession(currentCode);
        });
    }

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
        let tgId = tgUser?.id || 0;
        let tgUsername = tgUser?.username || '';
        if (!tgId) tgId = Number(localStorage.getItem('zeph_tg_id') || 0);
        if (!tgUsername) tgUsername = localStorage.getItem('zeph_tg_username') || '';

        // Check API URL if available
        const apiUrl = CONFIG.apiUrl || (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? `${window.location.protocol}//${window.location.hostname}:8088` : '');

        if (apiUrl) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 6000);

                const response = await fetch(`${apiUrl}/api/verify`, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Bypass-Tunnel-Reminder': '1'
                    },
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
                        if (trustedIp) localStorage.setItem('zeph_trusted_ip', trustedIp);
                        updateProfileUI(linkedNick, trustedIp, data.stats, data.zephyrs);
                    }
                    if (data.telegramId) {
                        localStorage.setItem('zeph_tg_id', data.telegramId);
                    }
                    if (data.telegramUsername) {
                        localStorage.setItem('zeph_tg_username', data.telegramUsername);
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
                console.error('API verify failed:', err);
                showPinError("Ошибка соединения с сервером! Проверьте интернет и повторите попытку.");
                return;
            }
        } else {
            showPinError("Сервер авторизации не настроен.");
            return;
        }
    }

    function rejectSession(targetCode) {
        try {
            if (tg?.sendData) {
                tg.sendData(JSON.stringify({ action: "reject", code: targetCode }));
            }
        } catch (_) {}

        const apiUrl = CONFIG.apiUrl || (window.location.hostname === 'localhost' ? 'http://localhost:8088' : '');
        if (apiUrl) {
            fetch(`${apiUrl}/api/reject`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Bypass-Tunnel-Reminder': '1'
                },
                body: JSON.stringify({ code: targetCode })
            }).catch(() => {});
        }

        switchView('error');
    }

    // Result Button Handlers
    const btnSuccessProfile = document.getElementById('btnSuccessProfile');
    if (btnSuccessProfile) {
        btnSuccessProfile.addEventListener('click', () => {
            switchView('profile');
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
