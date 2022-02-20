const game = document.getElementById('game');
const result = document.getElementById('result');
const resetBtn = document.getElementById('reset');
const aiPlayer = 'X',
  huPlayer = 'O';

class Game {
  constructor(size = 5) {
    this.size = size; // сторона поля
    this.victoryNum = 5;
    // массив ключевых последовательностей для выявления победной позиции
    this.checkArray = Array((this.limit - 1) / 2);
    // this.checkArray = this.checkArray.map((el) => (el = '_'));
    this.turn = Math.floor(Math.random() * 2); // рандом-выбор игрока, начин. игру
    this.turnCount = 0; // количество шагов
    resetBtn.addEventListener('click', () => {
      new Game();
    });
    this.cellList = [];
    this.resetGame(); // обнуление игры после победы
    // this.checkArray[0] = '_';
  }

  get limit() {
    return this.size * this.size; // полный размер поля
  }

  init() {
    for (let i = 0; i < this.limit; i++) {
      const cell = document.createElement('div'); // создаем див cell
      cell.setAttribute('data-id', i); // присваиваем аттрибут
      cell.addEventListener('click', this.humanPlay()); // назначаем обработчик
      const cellNum = document.createElement('div');
      cellNum.setAttribute('class', 'cellNum');
      cellNum.innerHTML = i;
      // cellNum.classList.add()
      cell.appendChild(cellNum);
      game.appendChild(cell); // добавляем в DOM-элемент game див cell
      game.style.cssText = `grid-template-columns: repeat(${this.size}, 1fr)`;

      this.cellList.push(cell);
    }
    for (let i = 0; i < this.checkArray.length; i++) {
      this.checkArray[i] = '*'.repeat(this.size);
    }
    // console.log(this.checkArray);
    // если в начале игры turn === 1, то первым ходит комп
    if (this.turn === 1) {
      // this.makeAiTurn();
    }
  }

  resetGame() {
    this.board = [...Array(this.limit).keys()];
    this.cellList = [];
    result.innerHTML = '';
    game.innerHTML = '';
    this.turnCount = 0;
    this.init();
  }

  humanPlay() {
    // срабатывает при клике на ячейке
    return (e) => {
      this.turnCount += 1;
      const id = +e.target.getAttribute('data-id'); // получаем ID ячейки
      this.board[id] = huPlayer; // записываем в позицию массива символ игрока
      this.cellList[id].innerHTML = `<span>${huPlayer}</span>`; // добавляем в DOM символ игрока
      if (this.turnCount >= this.limit) {
        result.innerHTML = `<h3> Draw! </h3>`;
        return;
      }

      if (this.checkWinner(this.board, huPlayer)) {
        // проверка на победную позицию
        result.innerHTML = `<h3>You win!</h3>`;
        return;
      }

      // this.makeAiTurn();
    };
  }

  makeAiTurn() {
    this.turnCount += 1;
    const bestMove = this.minimax(this.board, aiPlayer);
    console.log(bestMove);
    this.board[bestMove.index] = aiPlayer;
    this.cellList[bestMove.index].innerHTML = `<span>${aiPlayer}</span>`;
    if (this.turnCount >= this.limit) {
      result.innerHTML = `<h3> Draw! </h3>`;
      return;
    }
    if (this.checkWinner(this.board, aiPlayer)) {
      result.innerHTML = `<h3>AI win!</h3>`;
      return;
    }
  }

  checkWinner(board, player) {
    // let id = board.filter((cell) => cell === player);
    let indices = [];
    let ind = board.indexOf(player);
    while (ind != -1) {
      indices.push(ind);
      ind = board.indexOf(player, ind + 1);
    }
    indices.forEach((el) => {
      // проверка на победные состояния
      const id = +el; // получаем ID ячейки
      let rowNum = Math.floor(id / this.size); // номер строки в к-рую сходил чел
      // достаем значение этой строки из ключевого массива и разбиваем в посимвольный массив
      let row = this.checkArray[rowNum].split('');
      // заменяем в посимвольном массиве необходимую позицию на знак игрока
      row.splice(id % this.size, 1, huPlayer);
      // склеиваем обратно посимвольный массив в строку
      // и заменяем соответствующую позицию в ключевом массиве на новую строку
      this.checkArray[rowNum] = row.join('');
      // console.log(`checkArray[${rowNum}] = ${this.checkArray[rowNum]}`);

      let columnNum = (id % this.size) + this.size; // номер столбца в к-рый сходил чел
      let column = this.checkArray[columnNum].split('');
      column.splice(Math.floor(id / this.size), 1, huPlayer);
      this.checkArray[columnNum] = column.join('');
      // console.log(`checkArray[${columnNum}] = ${this.checkArray[columnNum]}`);
      // анализируем все диагонали
      for (let i = 0; i < this.size - (this.victoryNum - 1); i++) {
        if (
          // главная диагональ\ и диагонали\\ ВЫШЕ
          id % (this.size + 1) === i &&
          id <= this.limit - this.size * i
        ) {
          let checkArrayPos = 2 * this.size + (id % (this.size + 1)); // = 14+i
          let arrFromDiag = this.checkArray[checkArrayPos].split('');
          arrFromDiag.splice(Math.floor(id / (this.size + 1)), 1, huPlayer);
          this.checkArray[checkArrayPos] = arrFromDiag.join('');
        }
        if (
          // диагонали\\ НИЖЕ основной\
          id % (this.size + 1) === this.size + 1 - (1 + i) &&
          id > this.size - 1 &&
          i < this.size - this.victoryNum
        ) {
          let checkArrayPos =
            2 * this.size + (this.size - (this.victoryNum - 1)) + i; // = 17+i
          let arrFromDiag = this.checkArray[checkArrayPos].split('');
          arrFromDiag.splice(Math.floor(id / (this.size + 1)), 1, huPlayer);
          this.checkArray[checkArrayPos] = arrFromDiag.join('');
        }

        if (
          // главная диагональ/ и диагонали// НИЖЕ i=0
          id % (this.size - 1) === i &&
          id >= (this.size - 1) * (i + 1) &&
          id < this.limit - this.size + 1 + i
        ) {
          let checkArrayPos = 2 * this.size + (this.size - 2) + i; // = 19+i
          let arrFromDiag = this.checkArray[checkArrayPos].split('');
          arrFromDiag.splice(Math.floor(id / this.size), 1, huPlayer);
          this.checkArray[checkArrayPos] = arrFromDiag.join('');
        }
        if (
          // диагонали// ВЫШЕ основной/
          id % (this.size - 1) === this.size - 1 - (1 + i) &&
          id <= this.limit - 2 * (this.size + i) &&
          i < this.size - this.victoryNum
        ) {
          let checkArrayPos = 2 * this.size + (this.size + 1) + i; // = 22+i
          let arrFromDiag = this.checkArray[checkArrayPos].split('');
          arrFromDiag.splice(Math.floor(id / this.size), 1, huPlayer);
          this.checkArray[checkArrayPos] = arrFromDiag.join('');
        }
      }
      // console.log(this.checkArray);
    });

    const checkAvailability = (arr, val) => {
      return arr.some((arrVal) => {
        return arrVal.includes(val);
      });
    };

    if (checkAvailability(this.checkArray, 'O'.repeat(this.victoryNum))) {
      return true;
    } else {
      return false;
    }
  }

  findEmptyCells(board) {
    // выделяес из всей доски пустые клетки
    return board.filter((cell) => cell !== huPlayer && cell !== aiPlayer);
  }

  findHuCells(board) {
    // выделяес из всей доски пустые клетки
    // return board.indexOf(huPlayer);
    let huCells = [];
    board.forEach((el, i) => {
      el === huPlayer ? huCells.push(i) : null;
    });
    return huCells;
  }

  findAiCells(board) {
    // выделяес из всей доски пустые клетки
    let aiCells = [];
    board.forEach((el, i) => {
      el === aiPlayer ? aiCells.push(i) : null;
    });
    return aiCells;
  }

  // функция анализа и предсказания ходов и победных позиций
  minimax(board, player) {
    const emptyCells = this.findEmptyCells(board); // массив пустых клеток
    // console.log('emptyCells =', emptyCells);
    if (this.checkWinner(board, huPlayer)) {
      // если победное состояние у человека, то возвращаем -10
      return { score: -10 };
    }
    if (this.checkWinner(board, aiPlayer)) {
      // если победное состояние у компа, то возвращаем 10
      return { score: 10 };
    }
    if (emptyCells.length === 0) {
      // если пустых ячеек нет, то возвращаем 0
      return { score: 0 };
    }

    // доходим до этого момента в коде если предидущие 3 блока if вернули false
    let moves = []; // массив для всех возможных ходов
    for (let i = 0; i < emptyCells.length; i++) {
      let move = {}; // параметры конкретного хода
      board[emptyCells[i]] = player; // делаем ход за конкретного игрока(чел или комп)
      move.index = emptyCells[i]; // порядковый номер ячейки для послед. хода
      if (player === huPlayer) {
        const payload = this.minimax(board, aiPlayer);
        move.score = payload.score;
      }
      if (player === aiPlayer) {
        const payload = this.minimax(board, huPlayer);
        move.score = payload.score;
      }
      board[emptyCells[i]] = move.index;
      moves.push(move);
    }
    let bestMove;

    // на данный момент кода массив moves полностью заполнен всеми возможными ходами
    // выбор наилучшего хода, если очередь хода за компом
    if (player === aiPlayer) {
      let bestScore = -Infinity;
      for (let i = 0; i < moves.length; i++) {
        if (moves[i].score > bestScore) {
          // среди всех возможных ходов находим тот, что имеет значение 10
          // если их несколько, выбирается первый
          bestScore = moves[i].score;
          bestMove = i;
        }
      }
    }
    // выбор наилучшего хода, если очередь хода за челом
    if (player === huPlayer) {
      let bestScore = Infinity;
      for (let i = 0; i < moves.length; i++) {
        if (moves[i].score < bestScore) {
          // среди всех возможных ходов находим тот, что имеет значение -10
          // если их несколько, выбирается первый
          bestScore = moves[i].score;
          bestMove = i;
        }
      }
    }

    return moves[bestMove]; // возвращаем из цикла св-ва лучшего хода
  }
}

new Game(9); // запускаем игру
