// Player client logic for the endless tic tac toe experience.
document.addEventListener('DOMContentLoaded', () => {
  const socket = io("/", {
    path: "/ttt/socket.io"
  });
  
  const guideSection = document.getElementById('guide-section');
  const waitingSection = document.getElementById('waiting-section');
  const gameSection = document.getElementById('game-section');
  const resultSection = document.getElementById('result-section');

  const joinButton = document.getElementById('join-button');
  const nameInput = document.getElementById('player-name');
  const joinError = document.getElementById('join-error');
  const lobbyCount = document.getElementById('lobby-count');

  const boardElement = document.getElementById('board');
  const opponentLabel = document.getElementById('opponent-label');
  const turnLabel = document.getElementById('turn-label');
  const moveFeedback = document.getElementById('move-feedback');
  const resultMessage = document.getElementById('result-message');
  const requeueButton = document.getElementById('requeue-button');

  let playerId = null;
  let playerName = '';
  let currentMatchId = null;
  let yourTurn = false;
  let boardState = Array.from({ length: 9 }, () => ({ value: '', order: 0 }));

  // Utility function to toggle UI blocks.
  const toggleSection = (element, visible) => {
    element.classList.toggle('hidden', !visible);
  };

  const setMoveFeedback = (message = '') => {
    if (!message) {
      moveFeedback.classList.add('hidden');
      moveFeedback.textContent = '';
      return;
    }
    moveFeedback.textContent = message;
    moveFeedback.classList.remove('hidden');
  };

  const renderBoard = () => {
    boardElement.innerHTML = '';
    boardState.forEach((cellState, index) => {
      const cell = document.createElement('div');
      cell.className = 'board-cell';
      cell.textContent = cellState.value;
      if (cellState.order) {
        const tier = Math.min(cellState.order, 3);
        cell.classList.add(`move-order-${tier}`);
        cell.dataset.moveOrder = cellState.order;
      }
      if (!yourTurn || cellState.value) {
        cell.classList.add('disabled');
      }
      cell.addEventListener('click', () => {
        if (!yourTurn || boardState[index].value) {
          return;
        }
        setMoveFeedback('');
        socket.emit('make_move', { position: index });
      });
      boardElement.appendChild(cell);
    });
  };

  const updateTurnLabel = () => {
    if (!currentMatchId) {
      turnLabel.textContent = '';
      return;
    }
    turnLabel.textContent = yourTurn
      ? 'あんたの番よ！'
      : '相手の番だよ。ちょっとまってね。';
  };

  const resetGameView = () => {
    boardState = Array.from({ length: 9 }, () => ({ value: '', order: 0 }));
    renderBoard();
    setMoveFeedback('');
    updateTurnLabel();
  };

  joinButton.addEventListener('click', () => {
    const trimmed = nameInput.value.trim();
    if (!trimmed) {
      joinError.textContent = '本当の名前を入力してね。';
      joinError.classList.remove('hidden');
      return;
    }
    joinError.classList.add('hidden');
    socket.emit('player_join', { name: trimmed });
  });

  requeueButton.addEventListener('click', () => {
    if (!playerName) {
      return;
    }
    toggleSection(resultSection, false);
    toggleSection(waitingSection, true);
    socket.emit('player_join', { name: playerName });
  });

  socket.on('lobby_status', (data) => {
    lobbyCount.textContent = `今参加している人: ${data.count}人`;
  });

  socket.on('join_error', (data) => {
    joinError.textContent = data.message || 'エラーがおきました。';
    joinError.classList.remove('hidden');
  });

  socket.on('lobby_joined', (data) => {
    playerId = data.player_id;
    playerName = data.name;
    currentMatchId = null;
    yourTurn = false;
    toggleSection(guideSection, true);
    toggleSection(waitingSection, true);
    toggleSection(resultSection, false);
    toggleSection(gameSection, false);
    resetGameView();
  });

  socket.on('match_start', (data) => {
    currentMatchId = data.match_id;
    yourTurn = Boolean(data.your_turn);
    opponentLabel.textContent = `たいせんあいて: ${data.opponent}`;
    toggleSection(waitingSection, false);
    toggleSection(gameSection, true);
    toggleSection(resultSection, false);
    boardState = Array.from({ length: 9 }, () => ({ value: '', order: 0 }));
    renderBoard();
    updateTurnLabel();
  });

  socket.on('board_update', (data) => {
    if (!currentMatchId || (data.match_id && data.match_id !== currentMatchId)) {
      return;
    }
    const moveOrder = data.move_order || [];
    const incomingBoard = data.board || [];
    boardState = Array.from({ length: 9 }, (_, index) => ({
      value: incomingBoard[index] || '',
      order: moveOrder[index] || 0,
    }));
    yourTurn = data.turn_id === playerId;
    renderBoard();
    updateTurnLabel();
  });

  socket.on('move_rejected', () => {
    setMoveFeedback('そのマスはできないよ。べつのマスをためそう。');
  });

  socket.on('match_result', (data) => {
    if (data.bye) {
      resultMessage.textContent = 'やった！待っているだけで勝ちになったよ。';
    } else if (data.outcome === 'win') {
      if (data.by_disconnect) {
        resultMessage.textContent = `${data.opponent || '相手'}がいなくなって勝ちだよ。`;
      } else {
        resultMessage.textContent = `${data.opponent}に勝ったよ！おめでとう！`;
      }
    } else if (data.outcome === 'lose') {
      if (data.by_disconnect) {
        resultMessage.textContent = '通信が切れてしまったみたい。もう一度チャレンジしてね。';
      } else {
        resultMessage.textContent = `${data.opponent || '相手'}に負けちゃった。つぎは勝とう！`;
      }
    } else {
      resultMessage.textContent = '結果を受け取りました。';
    }
    yourTurn = false;
    currentMatchId = null;
    toggleSection(gameSection, false);
    toggleSection(waitingSection, false);
    toggleSection(resultSection, true);
    updateTurnLabel();
  });
});
