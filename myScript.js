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
    this.checkArray = Array(
      2 * this.size + 4 * (this.size - this.victoryNum) + 2
    );
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

  // изменение ячейки ключевого массива
  changeCheckArrayCell(id, player, num) {
    // достаем значение ячейки num из ключевого массива и сплитим
    // в самом начале игры получается ['*','*', ...] размором this.size
    let arrayFromNum = this.checkArray[num].split('');
    // заменяем в сплит-массиве необходимую позицию на знак player
    arrayFromNum.splice(Math.floor(id / this.size), 1, player);
    // console.log('Позиция', Math.floor(id / this.size));
    // склеиваем обратно сплит-массив в ячейку num
    // и запихиваем обратно в ключевом массиве на туже позицию
    this.checkArray[num] = arrayFromNum.join('');
    // console.log(`checkArray[${rowNum}] = ${this.checkArray[rowNum]}`);
  }
  // запись хода в ключевой массив
  makeMove(id, player) {
    let rowNum = Math.floor(id / this.size); // номер строки в к-рую сходил player
    // console.log('Строка', rowNum);
    this.changeCheckArrayCell(id, player, rowNum);

    let columnNum = (id % this.size) + this.size; // номер столбца в к-рый сходил чел
    // console.log('Столбец', columnNum);
    this.changeCheckArrayCell(id, player, columnNum);

    // анализируем все возможные диагонали
    // побочные диагонали расчитываются смещением вниз или вверх относительно основных
    // макс. смещение = this.size - (this.victoryNum - 1)
    for (let i = 0; i < this.size - (this.victoryNum - 1); i++) {
      if (
        // главная диагональ\ (при i=0) и побочные диагонали\\ ВЫШЕ (при i=1 или 2)
        id % (this.size + 1) === i &&
        id <= this.limit - this.size * i
      ) {
        // позиция в ключ. массиве = 14+i (при victoryNum = 7)
        let checkArrayPos = 2 * this.size + (id % (this.size + 1));
        // console.log('Диагональ(1 if)', checkArrayPos);
        this.changeCheckArrayCell(id, player, checkArrayPos);
      }
      if (
        // побочные диагонали\\ НИЖЕ основной\
        id % (this.size + 1) === this.size + 1 - (1 + i) &&
        id > this.size - 1 &&
        i < this.size - this.victoryNum
      ) {
        // позиция в ключ. массиве = 17+i (при victoryNum = 7)
        let checkArrayPos =
          2 * this.size + (this.size - (this.victoryNum - 1)) + i;
        // console.log('Диагональ(2 if)', checkArrayPos);
        this.changeCheckArrayCell(id, player, checkArrayPos);
      }
      if (
        // главная диагональ/ (при i=0) и побочные диагонали// НИЖЕ
        id % (this.size - 1) === i &&
        id >= (this.size - 1) * (i + 1) &&
        id < this.limit - this.size + 1 + i
      ) {
        // позиция в ключ. массиве = 19+i (при victoryNum = 7)
        let checkArrayPos =
          2 * this.size + 2 * (this.size - this.victoryNum) + 1 + i;
        // console.log('Диагональ(3 if)', checkArrayPos);
        this.changeCheckArrayCell(id, player, checkArrayPos);
      }
      if (
        // диагонали// ВЫШЕ основной/
        id % (this.size - 1) === this.size - 1 - (1 + i) &&
        id <= this.limit - 2 * (this.size + i) &&
        i < this.size - this.victoryNum
      ) {
        // позиция в ключ. массиве = 22+i (при victoryNum = 7)
        // let checkArrayPos = 2 * this.size + (this.size + 1) + i;
        let checkArrayPos = this.victoryNum * (this.size - 3) + 2 + i;
        // console.log('Диагональ(4 if)', checkArrayPos);
        this.changeCheckArrayCell(id, player, checkArrayPos);
      }
    }
    // console.log(this.checkArray);
  }
  // ход человека (срабатывает при клике на ячейке поля)
  humanPlay() {
    return (e) => {
      this.turnCount += 1;
      const id = +e.target.getAttribute('data-id'); // получаем ID ячейки
      this.board[id] = huPlayer; // записываем в позицию массива board символ игрока
      this.cellList[id].innerHTML = `<span>${huPlayer}</span>`; // добавляем в DOM символ игрока
      if (this.turnCount >= this.limit) {
        result.innerHTML = `<h3> Draw! </h3>`;
        return;
      }
      this.makeMove(id, huPlayer); // запись хода в ключевой массив
      // let indices = []; // массив со всеми ячейками, к-рые включают знак player
      // let ind = board.indexOf(player);
      // while (ind != -1) {
      //   indices.push(ind);
      //   ind = board.indexOf(player, ind + 1);
      // }
      // console.log(`indices = `, indices);

      if (this.checkWinner(/* this.board, */ huPlayer)) {
        // проверка на победную позицию
        result.innerHTML = `<h3>You win!</h3>`;
        return;
      }
      this.makeAiTurn(huPlayer);
    };
  }

  makeAiTurn(player) {
    // this.turnCount += 1;
    // const bestMove = this.minimax(this.board, aiPlayer);
    // console.log(bestMove);
    // this.board[bestMove.index] = aiPlayer;
    // this.cellList[bestMove.index].innerHTML = `<span>${aiPlayer}</span>`;
    // if (this.turnCount >= this.limit) {
    //   result.innerHTML = `<h3> Draw! </h3>`;
    //   return;
    // }
    // if (this.checkWinner(this.board, aiPlayer)) {
    //   result.innerHTML = `<h3>AI win!</h3>`;
    //   return;
    // }
    // console.log(this.checkArray);

    let indices = []; // номера ячеек ключ. массива, к-рые имеют 3 знака player или более
    this.checkArray.forEach((cell, index) => {
      if (cell.includes(player)) {
        let count = 0;
        let ind = cell.indexOf(player);
        while (ind != -1 && count <= this.victoryNum - 2) {
          ind = cell.indexOf(player, ind + 1);
          count++;
        }
        count >= this.victoryNum - 2 ? indices.push(index) : null; // отсекаем ячейки где знаков player < 3
      }
    });
    console.log('indices = ', indices);
  }

  // проверка ключевого массива на победное состояние
  checkWinner(/* board, */ player) {
    const checkWin = (arr, value) => {
      return arr.some((arrVal) => {
        return arrVal.includes(value);
      });
    };

    if (checkWin(this.checkArray, player.repeat(this.victoryNum))) {
      return true;
    } else {
      return false;
    }
  }

  findEmptyPosition(cell) {
    // выделяес из всей доски пустые клетки
    return board.filter((cell) => cell !== huPlayer && cell !== aiPlayer);
  }
  // выделяет из всей доски клетки чела
  findHuCells(board) {
    let huCells = [];
    board.forEach((el, i) => {
      el === huPlayer ? huCells.push(i) : null;
    });
    return huCells;
  }
  // выделяет из всей доски клетки AI
  findAiCells(board) {
    let aiCells = [];
    board.forEach((el, i) => {
      el === aiPlayer ? aiCells.push(i) : null;
    });
    return aiCells;
  }
  // функция анализа и предсказания ходов и победных позиций
  // myMiniMax(cell, player) {
  //   const emptyPosition =
  // }

  /*   minimax(board, player) {
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

    // доходим до этого момента если предидущие 3 блока if вернули false
    let moves = []; // массив для всех возможных ходов
    for (let i = 0; i < emptyCells.length; i++) {
      let move = {}; // параметры конкретного хода (индекс ячейки + score)
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
  } */
}

new Game(19); // запускаем игру
