const tg = window.Telegram.WebApp;
tg.expand();
tg.ready();

let currentScreen = 'main-menu';

const mainMenu = document.getElementById('main-menu');
const soloSettings = document.getElementById('solo-settings');

const btnSolo = document.getElementById('btn-solo');
const backToMenu = document.getElementById('back-to-menu');
const startGameBtn = document.getElementById('start-game');

const presetBtns = document.querySelectorAll('.preset-btn');
const customFields = document.getElementById('custom-fields');
const minesInput = document.getElementById('mines');
const minesInfo = document.getElementById('mines-info');

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
    currentScreen = screenId;
}

btnSolo.addEventListener('click', () => {
    showScreen('solo-settings');
    updateMinesRecommendation(9, 9);
});

backToMenu.addEventListener('click', () => {
    showScreen('main-menu');
});

presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        presetBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        if (btn.id === 'custom-size') {
            customFields.classList.remove('hidden');
        } else {
            customFields.classList.add('hidden');
            const width = parseInt(btn.dataset.width);
            const height = parseInt(btn.dataset.height);
            updateMinesRecommendation(width, height);
        }
    });
});

function updateMinesRecommendation(width, height) {
    const totalCells = width * height;
    const recommended = Math.floor(totalCells * 0.156);
    minesInput.value = recommended;
    minesInfo.textContent = `Рекомендуется: ${recommended} для ${width}×${height}`;
}

startGameBtn.addEventListener('click', () => {
    let width, height;

    const activePreset = document.querySelector('.preset-btn.active');
    
    if (activePreset.id === 'custom-size') {
        width = parseInt(document.getElementById('custom-width').value);
        height = parseInt(document.getElementById('custom-height').value);
    } else {
        width = parseInt(activePreset.dataset.width);
        height = parseInt(activePreset.dataset.height);
    }

    const mines = parseInt(minesInput.value);

    if (!width || !height || width < 5 || height < 5 || width > 30 || height > 30) {
        tg.showAlert('Размер поля должен быть от 5×5 до 30×30');
        return;
    }

    if (mines < 1 || mines >= width * height) {
        tg.showAlert('Количество мин должно быть от 1 до количества клеток минус 1');
        return;
    }

    tg.showPopup({
        title: 'Игра запущена!',
        message: `Поле: ${width}×${height}\nМин: ${mines}\n\nСледующий шаг — игровое поле.`,
        buttons: [{ text: 'OK', type: 'ok' }]
    });
});

tg.MainButton.hide();
console.log('FureZ Minesweeper v0.3 загружен');
