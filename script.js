// Инициализация Telegram WebApp
const tg = window.Telegram.WebApp;

// Расширяем приложение на весь экран и настраиваем внешний вид
tg.expand();
tg.setHeaderColor(tg.themeParams.bg_color || '#1e1e1e');
tg.setBackgroundColor(tg.themeParams.bg_color || '#1e1e1e');

// Основные элементы
const btnSolo = document.getElementById('btn-solo');
const btnCoop = document.getElementById('btn-coop');
const btnDuel = document.getElementById('btn-duel');

// Показываем Main Button (на всякий случай, можно убрать позже)
tg.MainButton.setText('Закрыть приложение');
tg.MainButton.hide();

// Обработчики кнопок (пока просто алерты — дальше заменишь на переходы)
btnSolo.addEventListener('click', () => {
    tg.showPopup({
        title: 'Одиночная игра',
        message: 'Переход в одиночный режим...\n\n(Здесь будет экран с настройками поля)',
        buttons: [{ text: 'OK', type: 'ok' }]
    });
    
    // Пример: в будущем здесь будет window.location.href = 'solo.html' или скрытие/показ блоков
});

btnCoop.addEventListener('click', () => {
    tg.showPopup({
        title: 'КООП режим',
        message: 'Выберите действие:\n\n• Создать комнату\n• Присоединиться',
        buttons: [
            { text: 'Понятно', type: 'ok' }
        ]
    });
});

btnDuel.addEventListener('click', () => {
    tg.showPopup({
        title: 'Дуэли',
        message: 'Соревнуйся с другом на время!\n\nСоздать или присоединиться?',
        buttons: [{ text: 'Понятно', type: 'ok' }]
    });
});

// Адаптация под смену темы Telegram (если пользователь переключит день/ночь)
tg.onEvent('themeChanged', () => {
    document.documentElement.style.setProperty('--tg-theme-bg-color', tg.themeParams.bg_color);
    document.documentElement.style.setProperty('--tg-theme-text-color', tg.themeParams.text_color);
    document.documentElement.style.setProperty('--tg-theme-accent-text-color', tg.themeParams.accent_text_color);
});

// Готовность приложения
console.log('FureZ Minesweeper загружен успешно!');
tg.ready();
