const tg = window.Telegram.WebApp;
tg.expand();
tg.ready();

let currentScreen = 'main-menu';
let board = [];
let rows = 9, cols = 9, totalMines = 10;
let revealedCount = 0;
let flagsPlaced = 0;
let timerInterval = null;
let seconds = 0;
let gameOver = false;
let firstClick = true;

// Переключение экранов
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
    currentScreen = screenId;
}

// Главное меню
document.getElementById('btn-solo').addEventListener('click', () => {
    showScreen('solo-setup');
});

document.getElementById('btn-coop').addEventListener('click', () => {
    tg.showPopup({ title: 'КООП', message: 'Скоро будет доступно!', buttons: [{text: 'OK', type: 'ok'}] });
});

document.getElementById('btn-duel').addEventListener('click', () => {
    tg.showPopup({ title: 'Дуэли', message: 'Скоро будет доступно!', buttons: [{text: 'OK', type: 'ok'}] });
});

// Настройки
const sizeSelect = document.getElementById('board-size');
const customSettings = document.getElementById('custom-settings');

sizeSelect.addEventListener('change', () => {
    if (sizeSelect.value === 'custom') {
        customSettings.classList.remove('hidden');
    } else {
        customSettings.classList.add('hidden');
    }
});

document.getElementById('btn-back-to-menu').addEventListener('click', () => {
    showScreen('main-menu');
});

document.getElementById('btn-start-game').addEventListener('click', () => {
    if (sizeSelect.value === 'custom') {
        rows = parseInt(document.getElementById('custom-rows').value);
        cols = parseInt(document.getElementById('custom-cols').value);
        totalMines = parseInt(document.getElementById('custom-mines').value);
    } else {
        const [r, c, m] = sizeSelect.value.split(',').map(Number);
        rows = r; cols = c; totalMines = m;
    }

    if (totalMines >= rows * cols) totalMines = Math.floor(rows * cols / 3);

    initGame();
    showScreen('game-screen');
});

// Инициализация игры
function initGame() {
    board = [];
    revealedCount = 0;
    flagsPlaced = 0;
    seconds = 0;
    gameOver = false;
    firstClick = true;

    clearInterval(timerInterval);
    document.getElementById('timer').textContent = '000';
    document.getElementById('mines-left').textContent = String(totalMines).padStart(3, '0');

    const boardEl = document.getElementById('board');
    boardEl.innerHTML = '';
    boardEl.style.gridTemplateColumns = `repeat(${cols}, 32px)`;

    for (let i = 0; i < rows; i++) {
        board[i] = [];
        for (let j = 0; j < cols; j++) {
            board[i][j] = {
                isMine: false,
                revealed: false,
                flagged: false,
                count: 0
            };

            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.row = i;
            cell.dataset.col = j;

            // Левая кнопка — открыть
            cell.addEventListener('click', handleLeftClick);

            // Правая кнопка / long tap — флаг
            cell.addEventListener('contextmenu', handleRightClick);
            cell.addEventListener('touchstart', handleTouchStart, { passive: true });

            boardEl.appendChild(cell);
        }
    }

    startTimer();
}

// Таймер
function startTimer() {
    clearInterval(timerInterval);
    seconds = 0;
    timerInterval = setInterval(() => {
        if (!gameOver) {
            seconds++;
            document.getElementById('timer').textContent = String(seconds).padStart(3, '0');
        }
    }, 1000);
}

// Обработка кликов (будет полностью реализовано в следующем шаге)
function handleLeftClick(e) {
    if (gameOver) return;
    const row = parseInt(e.target.dataset.row);
    const col = parseInt(e.target.dataset.col);
    // ... логика открытия клетки
    console.log(`Открыта клетка ${row},${col}`);
}

function handleRightClick(e) {
    e.preventDefault();
    if (gameOver) return;
    const row = parseInt(e.target.dataset.row);
    const col = parseInt(e.target.dataset.col);
    // ... логика флага
    console.log(`Флаг на ${row},${col}`);
}

function handleTouchStart(e) {
    // Для мобильных — длинное нажатие как правый клик (можно улучшить позже)
}

// Кнопки в игре
document.getElementById('btn-new-game').addEventListener('click', () => {
    initGame();
});

document.getElementById('btn-menu').addEventListener('click', () => {
    clearInterval(timerInterval);
    showScreen('main-menu');
});

// Запуск
tg.ready();
console.log('FureZ Minesweeper — одиночная игра готова к тестированию!');
