document.addEventListener('DOMContentLoaded', () => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
        tg.ready();
        tg.expand();
        // Set header color to match theme
        if (tg.setHeaderColor) {
            tg.setHeaderColor('secondary_bg_color');
        }
    }

    if (CONFIG.serverName) {
        document.getElementById('serverName').textContent = CONFIG.serverName;
    }

    // Parse session code from URL query or Telegram start param
    const urlParams = new URLSearchParams(window.location.search);
    let code = urlParams.get('code') || urlParams.get('tgWebAppStartParam');

    const loaderView = document.getElementById('loaderView');
    const confirmView = document.getElementById('confirmView');
    const manualView = document.getElementById('manualView');
    const successView = document.getElementById('successView');
    const errorView = document.getElementById('errorView');

    const playerAvatar = document.getElementById('playerAvatar');
    const playerName = document.getElementById('playerName');
    const playerIp = document.getElementById('playerIp');
    const ipRow = document.getElementById('ipRow');
    const sessionCodeBadge = document.getElementById('sessionCodeBadge');
    const statusPill = document.getElementById('statusPill');
    const errorTitle = document.getElementById('errorTitle');
    const errorDesc = document.getElementById('errorDesc');

    const btnConfirm = document.getElementById('btnConfirm');
    const btnReject = document.getElementById('btnReject');
    const btnCloseApp = document.getElementById('btnCloseApp');
    const btnRetry = document.getElementById('btnRetry');

    const pinBoxes = document.querySelectorAll('.pin-box');
    const btnManualSubmit = document.getElementById('btnManualSubmit');

    // Setup Close and Retry buttons
    btnCloseApp.addEventListener('click', () => {
        if (tg?.close) tg.close();
    });

    btnRetry.addEventListener('click', () => {
        showManualView();
    });

    if (code && code.trim().length > 0) {
        code = code.trim();
        loadSessionData(code);
    } else {
        // No code in URL -> show manual 6-digit PIN input
        showManualView();
    }

    function loadSessionData(sessionCode) {
        sessionCodeBadge.textContent = sessionCode;

        // If backend API URL is configured, fetch details
        if (CONFIG.apiUrl && CONFIG.apiUrl.startsWith("http")) {
            fetch(`${CONFIG.apiUrl}/api/session?code=${encodeURIComponent(sessionCode)}`)
                .then(res => res.json())
                .then(data => {
                    if (data.found) {
                        playerName.textContent = data.player || "Игрок";
                        if (data.ip) {
                            playerIp.textContent = data.ip;
                            ipRow.style.display = 'flex';
                        }
                        if (data.player) {
                            playerAvatar.src = `https://mc-heads.net/avatar/${encodeURIComponent(data.player)}/120`;
                        }
                        if (data.isIpChange) {
                            statusPill.textContent = "⚠️ Смена IP-адреса";
                            statusPill.style.background = "rgba(234, 179, 8, 0.15)";
                            statusPill.style.color = "#facc15";
                        } else {
                            statusPill.textContent = "✨ Новый аккаунт";
                        }
                    }
                    showConfirmView();
                })
                .catch(() => {
                    // Fallback to displaying code
                    showConfirmView();
                });
        } else {
            // Direct mode without external API
            showConfirmView();
        }
    }

    function showConfirmView() {
        loaderView.style.display = 'none';
        manualView.style.display = 'none';
        confirmView.style.display = 'block';
    }

    function showManualView() {
        loaderView.style.display = 'none';
        confirmView.style.display = 'none';
        manualView.style.display = 'block';
        setupPinInputs();
    }

    // Action: Confirm button clicked
    btnConfirm.addEventListener('click', () => {
        submitVerification(sessionCodeBadge.textContent);
    });

    // Action: Reject button clicked
    btnReject.addEventListener('click', () => {
        if (!confirm("Вы уверены, что хотите отклонить вход?")) {
            return;
        }

        const currentCode = sessionCodeBadge.textContent;
        if (CONFIG.apiUrl && CONFIG.apiUrl.startsWith("http")) {
            fetch(`${CONFIG.apiUrl}/api/reject`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: currentCode })
            }).catch(() => {});
        } else if (CONFIG.botUsername) {
            if (tg?.openTelegramLink) {
                tg.openTelegramLink(`https://t.me/${CONFIG.botUsername}?start=reject_${currentCode}`);
            }
        }

        if (tg?.HapticFeedback) {
            tg.HapticFeedback.notificationOccurred('warning');
        }

        confirmView.style.display = 'none';
        errorTitle.textContent = "Вход отклонён";
        errorDesc.textContent = "Запрос на вход отклонён, игрок отключен.";
        errorView.style.display = 'block';
    });

    function submitVerification(targetCode) {
        btnConfirm.disabled = true;
        btnConfirm.textContent = "Подтверждение...";

        const tgUser = tg?.initDataUnsafe?.user;

        // Mode 1: If external API is available
        if (CONFIG.apiUrl && CONFIG.apiUrl.startsWith("http")) {
            const payload = {
                code: targetCode,
                telegram_id: tgUser?.id || 0,
                username: tgUser?.username || ""
            };

            fetch(`${CONFIG.apiUrl}/api/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    showSuccess();
                } else {
                    throw new Error(data.error || "Код не найден");
                }
            })
            .catch(() => {
                // If API failed, fallback to native Telegram bot callback!
                fallbackTelegramVerification(targetCode);
            });
        } else {
            // Mode 2: Direct Telegram Bot callback
            fallbackTelegramVerification(targetCode);
        }
    }

    function fallbackTelegramVerification(targetCode) {
        let sent = false;
        try {
            // Native Telegram sendData (works when opened from keyboard/menu button)
            if (tg?.sendData) {
                tg.sendData(JSON.stringify({ action: "auth", code: targetCode }));
                sent = true;
            }
        } catch (e) {
            sent = false;
        }

        // If sendData was not supported (e.g. inline webapp), open bot direct callback
        if (!sent && CONFIG.botUsername) {
            if (tg?.openTelegramLink) {
                tg.openTelegramLink(`https://t.me/${CONFIG.botUsername}?start=auth_${targetCode}`);
            }
        }

        showSuccess();
    }

    function showSuccess() {
        if (tg?.HapticFeedback) {
            tg.HapticFeedback.notificationOccurred('success');
        }
        confirmView.style.display = 'none';
        manualView.style.display = 'none';
        successView.style.display = 'block';
    }

    // Manual PIN Input logic
    function setupPinInputs() {
        pinBoxes.forEach((box, index) => {
            box.value = '';
            box.addEventListener('input', (e) => {
                const val = e.target.value.replace(/[^0-9]/g, '');
                e.target.value = val;

                if (val && index < pinBoxes.length - 1) {
                    pinBoxes[index + 1].focus();
                }

                checkPinComplete();
            });

            box.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace' && !box.value && index > 0) {
                    pinBoxes[index - 1].focus();
                }
            });
        });

        if (pinBoxes.length > 0) {
            pinBoxes[0].focus();
        }
    }

    function checkPinComplete() {
        let pin = '';
        pinBoxes.forEach(b => pin += b.value);
        if (pin.length === 6) {
            btnManualSubmit.disabled = false;
        } else {
            btnManualSubmit.disabled = true;
        }
    }

    btnManualSubmit.addEventListener('click', () => {
        let pin = '';
        pinBoxes.forEach(b => pin += b.value);
        if (pin.length === 6) {
            submitVerification(pin);
        }
    });
});
