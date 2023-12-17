const selectors = {
    boardContainer: document.querySelector('.board-container'),
    board: document.querySelector('.board'),
    moves: document.querySelector('.moves'),
    timer: document.querySelector('.timer'),
    start: document.querySelector('#startButton'),
    restart: document.querySelector('#restartButton'),
    win: document.querySelector('.win')
}


const state = {
    gameStarted: false,
    flippedCards: 0,
    totalFlips: 0,
    totalTime: 0,
    loop: null
}

const shuffle = array => {
    const clonedArray = [...array]

    for (let i = clonedArray.length - 1; i > 0; i--) {
        const randomIndex = Math.floor(Math.random() * (i + 1))
        const original = clonedArray[i]

        clonedArray[i] = clonedArray[randomIndex]
        clonedArray[randomIndex] = original
    }

    return clonedArray
}

const pickRandom = (array, items) => {
    const clonedArray = [...array]
    const randomPicks = []

    for (let i = 0; i < items; i++) {
        const randomIndex = Math.floor(Math.random() * clonedArray.length)

        randomPicks.push(clonedArray[randomIndex])
        clonedArray.splice(randomIndex, 1)
    }

    return randomPicks
}

const generateGame = () => {
    const dimensions = selectors.board.getAttribute('data-dimension')

    if (dimensions % 2 !== 0) {
        throw new Error("The dimension of the board must be an even number.")
    }

    const emojis = ['🚗', '🚕', '🚙', '🏎️', '🚓', '🚑', '🚒', '🚐', '🚚', '🚜'];
    const picks = pickRandom(emojis, (dimensions * dimensions) / 2);
    const items = shuffle([...picks, ...picks]);
    const cards = `
        <div class="board" style="grid-template-columns: repeat(${dimensions}, auto)">
            ${items.map(item => `
                <div class="card">
                    <div class="card-front"></div>
                    <div class="card-back">${item}</div>
                </div>
            `).join('')}
        </div>
    `

    const parser = new DOMParser().parseFromString(cards, 'text/html')

    selectors.board.replaceWith(parser.querySelector('.board'))
}

const startGame = () => {
    state.gameStarted = true
    selectors.start.classList.add('disabled')

    state.loop = setInterval(() => {
        state.totalTime++

        selectors.moves.innerText = `${state.totalFlips} moves`
        selectors.timer.innerText = `Time: ${state.totalTime} sec`
    }, 1000)
}

const restartGame = () => {
    console.log('Restarting the game');
    state.gameStarted = false;
    state.flippedCards = 0;
    state.totalFlips = 0;
    state.totalTime = 0;
    clearInterval(state.loop);

    selectors.start.classList.remove('disabled');

    // Reset stats display
    selectors.moves.innerText = `0 moves`;
    selectors.timer.innerText = `Time: 0 sec`;


    // Hide win message
    selectors.boardContainer.classList.remove('flipped');
    selectors.win.innerHTML = '';

    // Reset matched cards visibility
    document.querySelectorAll('.card.matched').forEach(card => {
        card.style.visibility = 'visible';
        card.style.transform = 'scale(1)';
        generateGame();
        shuffle;
    });
};

const flipBackCards = () => {
    console.log('Flipping back open cards');
    document.querySelectorAll('.card.flipped:not(.matched)').forEach(card => {
        card.classList.remove('flipped')
    })

    state.flippedCards = 0
};

const handleMatchedCards = () => {
    const flippedCards = document.querySelectorAll('.flipped:not(.matched)');

    if (flippedCards.length === 2) {
        if (flippedCards[0].innerText === flippedCards[1].innerText) {
            flippedCards.forEach(card => card.classList.add('matched'));
            // You can add additional logic here when cards are matched
        }
        
        setTimeout(() => {
            flipBackCards();
        }, 1000);
    }
};

let isFlipping = false;

const flipCard = card => {
    if (isFlipping) {
        return; // Ignore clicks during a flip animation
    }
    state.flippedCards++;
    state.totalFlips++;

    if (!state.gameStarted) {
        startGame();
    }

    if (state.flippedCards <= 2) {
        card.classList.add('flipped');
    }

    handleMatchedCards();

    if (!document.querySelectorAll('.card:not(.flipped)').length) {
        setTimeout(() => {
            selectors.boardContainer.classList.add('flipped');
            selectors.win.innerHTML = `
                <span class="win-text">
                    You won!<br />
                    with <span class="highlight">${state.totalFlips}</span> moves<br />
                    under <span class="highlight">${state.totalTime}</span> seconds
                </span>
            `;

            clearInterval(state.loop);
        }, 1000);
    }
}


const attachEventListeners = () => {
    selectors.start.addEventListener('click', startGame);
    selectors.restart.addEventListener('click', restartGame);
    document.addEventListener('click', event => {
        const eventTarget = event.target
        const eventParent = eventTarget.parentElement

        if (eventTarget.className.includes('card') && !eventParent.className.includes('flipped')) {
            flipCard(eventParent)
        } else if (eventTarget.nodeName === 'BUTTON' && !eventTarget.className.includes('disabled')) {
            startGame()
        } else if (eventTarget.id === 'restartButton') {
            restartGame();
        }
    })
}

generateGame()
attachEventListeners()
