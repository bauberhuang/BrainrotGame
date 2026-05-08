// Admin dashboard controls for matchmaking and live viewing.
document.addEventListener('DOMContentLoaded', () => {
  const socket = io("/", {
    path: "/ttt/socket.io"
  });

  const qrBox = document.querySelector('.qr-box');
  const qrImage = document.getElementById('qr-image');
  const startButton = document.getElementById('start-match');
  const waitingList = document.getElementById('waiting-list');
  const activeMatches = document.getElementById('active-matches');
  const completedList = document.getElementById('completed-list');
  const connectedCount = document.getElementById('connected-count');

  const viewerBoard = document.getElementById('viewer-board');
  const viewerLabel = document.getElementById('viewer-label');
  const viewerTurn = document.getElementById('viewer-turn');
  const viewerAlert = document.getElementById('viewer-alert');

  let wantQrVisible = true;
  let qrAvailable = false;

  const updateQrVisibility = () => {
    if (!qrBox) {
      return;
    }
    const shouldShow = wantQrVisible && qrAvailable;
    if (shouldShow) {
      qrBox.classList.remove('hidden');
      if (qrImage) {
        qrImage.classList.remove('hidden');
      }
    } else {
      qrBox.classList.add('hidden');
      if (qrImage) {
        qrImage.classList.add('hidden');
      }
    }
  };

  if (qrImage) {
    const markAvailable = () => {
      qrAvailable = true;
      updateQrVisibility();
    };

    const markUnavailable = () => {
      qrAvailable = false;
      updateQrVisibility();
    };

    qrImage.addEventListener('load', markAvailable);
    qrImage.addEventListener('error', markUnavailable);

    if (qrImage.complete) {
      if (qrImage.naturalWidth > 0) {
        markAvailable();
      } else {
        markUnavailable();
      }
    }
  } else {
    qrAvailable = false;
    updateQrVisibility();
  }

  let currentMatchId = null;
  let viewerState = Array.from({ length: 9 }, () => ({ value: '', order: 0 }));

  const renderViewerBoard = () => {
    viewerBoard.innerHTML = '';
    viewerState.forEach((cellState) => {
      const cell = document.createElement('div');
      cell.className = 'board-cell disabled';
      cell.textContent = cellState.value;
      if (cellState.order) {
        const tier = Math.min(cellState.order, 3);
        cell.classList.add(`move-order-${tier}`);
        cell.dataset.moveOrder = cellState.order;
      }
      viewerBoard.appendChild(cell);
    });
  };

  renderViewerBoard();

  const updateWaitingList = (names) => {
    waitingList.innerHTML = '';
    if (!names.length) {
      const empty = document.createElement('li');
      empty.textContent = 'いまはだれもいません。';
      waitingList.appendChild(empty);
      return;
    }
    names.forEach((name) => {
      const item = document.createElement('li');
      item.textContent = name;
      waitingList.appendChild(item);
    });
  };

  const updateActiveMatches = (matches) => {
    activeMatches.innerHTML = '';
    if (!matches.length) {
      const empty = document.createElement('p');
      empty.textContent = 'まだ対戦がありません。';
      activeMatches.appendChild(empty);
      return;
    }
    matches.forEach((match) => {
      const item = document.createElement('div');
      item.className = 'match-item';
      if (match.match_id === currentMatchId) {
        item.classList.add('active');
      }
      item.textContent = match.display;
      item.addEventListener('click', () => {
        currentMatchId = match.match_id;
        viewerAlert.classList.add('hidden');
        socket.emit('watch_match', { match_id: match.match_id });
        updateActiveMatches(matches);
        viewerLabel.textContent = `${match.display} を観戦中`;
      });
      activeMatches.appendChild(item);
    });
  };

  const updateCompleted = (entries) => {
    completedList.innerHTML = '';
    if (!entries.length) {
      const empty = document.createElement('li');
      empty.textContent = 'まだ勝者はいません。';
      completedList.appendChild(empty);
      return;
    }
    entries.forEach((entry) => {
      const item = document.createElement('li');
      item.textContent = `${entry.pair} / 勝者 ${entry.winner}`;
      completedList.appendChild(item);
    });
  };

  startButton.addEventListener('click', () => {
    socket.emit('start_matching', {});
  });

  socket.on('connect', () => {
    socket.emit('admin_join', {});
  });

  socket.on('lobby_status', (data) => {
    connectedCount.textContent = `いま参加している人: ${data.count}人`;
  });

  socket.on('admin_state', (data) => {
    updateWaitingList(data.waiting || []);
    updateActiveMatches(data.active_matches || []);
    updateCompleted(data.completed || []);
    const stillActive = (data.active_matches || []).some(
      (entry) => entry.match_id === currentMatchId,
    );
    if (!stillActive) {
      currentMatchId = null;
      viewerLabel.textContent = '試合を選ぶとここに表示されます。';
      viewerTurn.textContent = '';
      viewerState = Array.from({ length: 9 }, () => ({ value: '', order: 0 }));
      renderViewerBoard();
    }
    wantQrVisible = Boolean(data.show_qr);
    updateQrVisibility();
  });

  socket.on('board_update', (data) => {
    if (!data.match_id || (currentMatchId && data.match_id !== currentMatchId)) {
      return;
    }
    currentMatchId = data.match_id;
    const moveOrder = data.move_order || [];
    const incomingBoard = data.board || [];
    viewerState = Array.from({ length: 9 }, (_, index) => ({
      value: incomingBoard[index] || '',
      order: moveOrder[index] || 0,
    }));
    viewerTurn.textContent = `ただいま ${data.turn} さんのばん`;
    viewerAlert.classList.add('hidden');
    renderViewerBoard();
  });

  socket.on('match_finished', (data) => {
    viewerAlert.textContent = `${data.pair} / 勝者 ${data.winner}`;
    viewerAlert.classList.remove('hidden');
    viewerTurn.textContent = '';
  });

  socket.on('watch_error', (data) => {
    viewerAlert.textContent = data.message || '試合を表示できません。';
    viewerAlert.classList.remove('hidden');
  });
});
