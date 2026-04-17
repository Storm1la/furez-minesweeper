const tg = window.Telegram.WebApp;
tg.expand();
tg.ready();

let currentScreen = 'main-menu';
let gameBoard = [];
let gameRows = 0;
let gameCols = 0;
let totalMines = 0;
let revealedCount = 0;
let flagsPlaced = 0;
let timerInterval = null;
let seconds = 0;
let isGameOver = false;
let isFirstClick = true;

// Экраны
const mainMenu = document.getElementById('main-menu');
const soloSettings = document.getElementById('solo-settings');
const gameScreen = document.getElementById('game-screen');

// Элементы настроек
const btnSolo = document.getElementById('btn-solo');
const backToMenu = document.getElementById('back-to-menu');
const startGameBtn = document.getElementById('start-game');
const presetBtns = document.querySelectorAll('.preset-btn');
const customFields = document.getElementById('custom-fields');
const customWidth = document.getElementById('custom-width');
const customHeight = document.getElementById('custom-height');
const minesInput = document.getElementById('mines');
const minesInfo = document.getElementById('mines-info');

// Элементы игры
const gameField = document.getElementById('game-field');
const timerEl = document.getElementById('timer');
const minesLeftEl = document.getElementById('mines-left');
const backFromGame = document.getElementById('back-from-game');
const restartGameBtn = document.getElementById('restart-game');
const gameStatus = document.getElementById('game-status');

// ==================== НАВИГАЦИЯ ====================
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
    currentScreen = screenId;
}

btnSolo.addEventListener('click', () => {
    showScreen('solo-settings');
    updateMinesRecommendation(9, 9);
});

backToMenu.addEventListener('click', () => showScreen('main-menu'));

backFromGame.addEventListener('click', () => {
    clearInterval(timerInterval);
    showScreen('solo-settings');
});

// ==================== НАСТРОЙКИ ====================
presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        presetBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        if (btn.id === 'custom-size') {
            customFields.classList.remove('hidden');
            updateCustomMines();
        } else {
            customFields.classList.add('hidden');
            updateMinesRecommendation(parseInt(btn.dataset.width), parseInt(btn.dataset.height));
        }
    });
});

function updateCustomMines() {
    const w = parseInt(customWidth.value) || 10;
    const h = parseInt(customHeight.value) || 10;
    updateMinesRecommendation(w, h);
}

customWidth.addEventListener('input', updateCustomMines);
customHeight.addEventListener('input', updateCustomMines);

function updateMinesRecommendation(width, height) {
    const total = width * height;
    let rec = Math.floor(total * 0.156);
    rec = Math.max(1, Math.min(rec, total - 1));
    minesInput.value = rec;
    minesInfo.textContent = `Рекомендуется: ${rec} для ${width}×${height}`;
}

minesInput.addEventListener('input', () => {
    const active = document.querySelector('.preset-btn.active');
    let w, h;
    if (active.id === 'custom-size') {
        w = parseInt(customWidth.value) || 10;
        h = parseInt(customHeight.value) || 10;
    } else {
        w = parseInt(active.dataset.width);
        h = parseInt(active.dataset.height);
    }
    const maxMines = w * h - 1;
    let val = parseInt(minesInput.value);
    if (val > maxMines) minesInput.value = maxMines;
    if (val < 1) minesInput.value = 1;
});

// ==================== ЗАПУСК ИГРЫ ====================
startGameBtn.addEventListener('click', () => {
    let rows, cols;

    const active = document.querySelector('.preset-btn.active');
    if (active.id === 'custom-size') {
        rows = parseInt(customWidth.value);
        cols = parseInt(customHeight.value);
    } else {
        rows = parseInt(active.dataset.height);
        cols = parseInt(active.dataset.width);
    }

    const mines = parseInt(minesInput.value);

    // Проверка ограничений
    if (rows < 5 || cols < 5 || rows > 30 || cols > 30) {
        tg.showAlert('Размер поля должен быть от 5 до 30');
        return;
    }
    if (mines < 1 || mines >= rows * cols) {
        tg.showAlert('Некорректное количество мин');
        return;
    }

    // Запускаем игру
    startNewGame(rows, cols, mines);
});

function startNewGame(rows, cols, mines) {
    gameRows = rows;
    gameCols = cols;
    totalMines = mines;
    revealedCount = 0;
    flagsPlaced = 0;
    isGameOver = false;
    isFirstClick = true;
    seconds = 0;

    clearInterval(timerInterval);
    gameStatus.textContent = '';

    // Создаём пустое поле
    gameBoard = Array(rows).fill().map(() => 
        Array(cols).fill().map(() => ({
            isMine: false,
            revealed: false,
            flagged: false,
            adjacentMines: 0
        }))
    );

    // Генерация поля будет при первом клике (чтобы первое нажатие никогда не было миной)

    showScreen('game-screen');
    renderField();
    startTimer();
    updateMinesLeft();
}

function startTimer() {
    timerEl.textContent = '00:00';
    timerInterval = setInterval(() => {
        seconds++;
        const min = String(Math.floor(seconds / 60)).padStart(2, '0');
        const sec = String(seconds % 60).padStart(2, '0');
        timerEl.textContent = `${min}:${sec}`;
    }, 1000);
}

function updateMinesLeft() {
    const left = totalMines - flagsPlaced;
    minesLeftEl.textContent = String(left).padStart(3, '0');
}

// ==================== РЕНДЕР ПОЛЯ ====================
function renderField() {
    gameField.innerHTML = '';
    gameField.style.gridTemplateColumns = `repeat(${gameCols}, 32px)`;

    for (let r = 0; r < gameRows; r++) {
        for (let c = 0; c < gameCols; c++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.row = r;
            cell.dataset.col = c;

            cell.addEventListener('click', handleLeftClick);
            cell.addEventListener('contextmenu', handleRightClick);

            gameField.appendChild(cell);
        }
    }
}

// ==================== ОБРАБОТКА КЛИКОВ ====================
function handleLeftClick(e) {
    if (isGameOver) return;
    const row = parseInt(e.target.dataset.row);
    const col = parseInt(e.target.dataset.col);

    if (gameBoard[row][col].flagged) return;

    if (isFirstClick) {
        placeMines(row, col);
        isFirstClick = false;
    }

    revealCell(row, col);
}

function handleRightClick(e) {
    e.preventDefault();
    if (isGameOver || isFirstClick) return;

    const row = parseInt(e.target.dataset.row);
    const col = parseInt(e.target.dataset.col);
    const cellData = gameBoard[row][col];

    if (cellData.revealed) return;

    cellData.flagged = !cellData.flagged;
    flagsPlaced += cellData.flagged ? 1 : -1;
    updateMinesLeft();

    const cellEl = e.target;
    if (cellData.flagged) {
        cellEl.classList.add('flagged');
    } else {
        cellEl.classList.remove('flagged');
    }
}

function placeMines(firstRow, firstCol) {
    let placed = 0;
    while (placed < totalMines) {
        const r = Math.floor(Math.random() * gameRows);
        const c = Math.floor(Math.random() * gameCols);

        if (r === firstRow && c === firstCol) continue;
        if (gameBoard[r][c].isMine) continue;

        gameBoard[r][c].isMine = true;
        placed++;
    }

    // Подсчёт соседних мин
    for (let r = 0; r < gameRows; r++) {
        for (let c = 0; c < gameCols; c++) {
            if (gameBoard[r][c].isMine) continue;
            gameBoard[r][c].adjacentMines = countAdjacentMines(r, c);
        }
    }
}

function countAdjacentMines(row, col) {
    let count = 0;
    for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            const r = row + dr;
            const c = col + dc;
            if (r >= 0 && r < gameRows && c >= 0 && c < gameCols && gameBoard[r][c].isMine) {
                count++;
            }
        }
    }
    return count;
}

function revealCell(row, col) {
    const cellData = gameBoard[row][col];
    if (cellData.revealed || cellData.flagged) return;

    cellData.revealed = true;
    revealedCount++;

    const cellEl = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
    cellEl.classList.add('revealed');

    if (cellData.isMine) {
        cellEl.classList.add('mine');
        endGame(false);
        return;
    }

    if (cellData.adjacentMines > 0) {
        cellEl.textContent = cellData.adjacentMines;
        cellEl.classList.add(`number-${cellData.adjacentMines}`);
    } else {
        // Рекурсивное открытие пустых клеток
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                const r = row + dr;
                const c = col + dc;
                if (r >= 0 && r < gameRows && c >= 0 && c < gameCols) {
                    revealCell(r, c);
                }
            }
        }
    }

    if (revealedCount === gameRows * gameCols - totalMines) {
        endGame(true);
    }
}

function endGame(won) {
    isGameOver = true;
    clearInterval(timerInterval);

    if (won) {
        gameStatus.textContent = '🎉 Победа!';
        gameStatus.style.color = '#4ade80';
    } else {
        gameStatus.textContent = '💥 Взрыв!';
        gameStatus.style.color = '#f87171';
        
        // Показываем все мины
        for (let r = 0; r < gameRows; r++) {
            for (let c = 0; c < gameCols; c++) {
                if (gameBoard[r][c].isMine) {
                    const cell = document.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`);
                    if (!cell.classList.contains('revealed')) {
                        cell.classList.add('revealed', 'mine');
                    }
                }
            }
        }
    }
}

// Рестарт текущей игры
restartGameBtn.addEventListener('click', () => {
    startNewGame(gameRows, gameCols, totalMines);
});

console.log('FureZ Minesweeper v0.5 загружен');
