const tg = window.Telegram.WebApp;
tg.expand();
tg.ready();

const mainMenu = document.getElementById('main-menu');
const soloSettings = document.getElementById('solo-settings');

const btnSolo = document.getElementById('btn-solo');
const backToMenu = document.getElementById('back-to-menu');
const startGameBtn = document.getElementById('start-game');

const presetBtns = document.querySelectorAll('.preset-btn');
const customFields = document.getElementById('custom-fields');
const customWidth = document.getElementById('custom-width');
const customHeight = document.getElementById('custom-height');
const minesInput = document.getElementById('mines');
const minesInfo = document.getElementById('mines-info');

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

btnSolo.addEventListener('click', () => {
    showScreen('solo-settings');
    updateMinesRecommendation(9, 9);
});

backToMenu.addEventListener('click', () => {
    showScreen('main-menu');
});

// Выбор пресетов
presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        presetBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        if (btn.id === 'custom-size') {
            customFields.classList.remove('hidden');
            updateCustomMines();
        } else {
            customFields.classList.add('hidden');
            const width = parseInt(btn.dataset.width);
            const height = parseInt(btn.dataset.height);
            updateMinesRecommendation(width, height);
        }
    });
});

// Ограничение ширины и высоты (5–30)
function clampValue(input, min, max) {
    let value = parseInt(input.value);
    if (isNaN(value)) value = min;
    if (value < min) value = min;
    if (value > max) value = max;
    input.value = value;
}

customWidth.addEventListener('input', () => {
    clampValue(customWidth, 5, 30);
    updateCustomMines();
});

customHeight.addEventListener('input', () => {
    clampValue(customHeight, 5, 30);
    updateCustomMines();
});

// Динамическое обновление рекомендации мин
function updateCustomMines() {
    const width = parseInt(customWidth.value) || 10;
    const height = parseInt(customHeight.value) || 10;
    updateMinesRecommendation(width, height);
}

function updateMinesRecommendation(width, height) {
    if (width < 5 || height < 5) return;
    
    const totalCells = width * height;
    let recommended = Math.floor(totalCells * 0.156);
    recommended = Math.min(recommended, totalCells - 1); // не больше клеток - 1
    recommended = Math.max(1, recommended);

    minesInput.value = recommended;
    minesInfo.textContent = `Рекомендуется: ${recommended} для ${width}×${height}`;
}

// Ограничение количества мин
minesInput.addEventListener('input', () => {
    const width = parseInt(document.querySelector('.preset-btn.active').id === 'custom-size' 
        ? customWidth.value 
        : document.querySelector('.preset-btn.active').dataset.width);
    
    const height = parseInt(document.querySelector('.preset-btn.active').id === 'custom-size' 
        ? customHeight.value 
        : document.querySelector('.preset-btn.active').dataset.height);
    
    const totalCells = width * height;
    let value = parseInt(minesInput.value);
    
    if (isNaN(value)) value = 1;
    if (value < 1) value = 1;
    if (value > totalCells - 1) value = totalCells - 1;
    
    minesInput.value = value;
});

// Кнопка "Начать игру"
startGameBtn.addEventListener('click', () => {
    let width, height;

    const activePreset = document.querySelector('.preset-btn.active');
    
    if (activePreset.id === 'custom-size') {
        width = parseInt(customWidth.value);
        height = parseInt(customHeight.value);
    } else {
        width = parseInt(activePreset.dataset.width);
        height = parseInt(activePreset.dataset.height);
    }

    const mines = parseInt(minesInput.value);

    tg.showPopup({
        title: 'Игра запущена!',
        message: `Поле: ${width}×${height}\nМин: ${mines}`,
        buttons: [{ text: 'OK', type: 'ok' }]
    });
});

tg.MainButton.hide();
console.log('FureZ Minesweeper v0.4 загружен');
