import Store from "./store.js";
import View from "./view.js";

const players = [
  {
    id: 1,
    name: "Player 1",
    iconClass: "fa-x",
    colorClass: "turquoise",
  },
  {
    id: 2,
    name: "Player 2",
    iconClass: "fa-o",
    colorClass: "yellow",
  },
];

function init() {
  const view = new View();
  const store = new Store("live-t3-storage-key", players);

  function initView() {
    view.closeAll();

    // This clears the gameboard and resets the current player to Player 1
    view.clearMoves();
    view.setTurnIndicator(store.game.currentPlayer);

    // Update the score board by checking the player stats at the end of
    // a round. If a player doesn't have any wins, return a zero. Same
    // for ties.
    view.updateScoreBoard(
      store.stats.playerWithStats[0].wins,
      store.stats.playerWithStats[1].wins,
      store.stats.ties
    );
  }

  // Call the initView function immediately to load the correct state
  initView();

  view.bindGameResetEvent((event) => {
    // This resets the state to the initial state
    store.reset();
    initView();
  });

  // Functionality for the New Round button.
  view.bindNewRoundEvent((event) => {
    store.newRound();
    initView();
  });

  view.bindPlayerMoveEvent((square) => {
    // create variable to check if square has a move in it already
    const existingMove = store.game.moves.find(
      (move) => move.squareId === +square.id
    );

    // if the square already has a move in it, then return early
    if (existingMove) {
      return;
    }

    // Place an icon of the current player in a square
    view.handlePlayerMove(square, store.game.currentPlayer);

    // Advance to the next state by pushing a move to moves array
    // Sends id of clicked square to Store to track player move
    // clickedSquare.id will come through as a string by default,
    // so (+) transforms the value from a string to a number
    store.playerMove(+square.id);

    //
    if (store.game.status.isComplete) {
      view.openModal(
        store.game.status.winner
          ? `${store.game.status.winner.name} wins!`
          : "Tie!"
      );

      return;
    }

    // Set the next player's turn indicator
    // This store.game.currentPlayer is different than the one above,
    // because we sent the player move data to Store and updated the state
    // with store.playerMove() to let the players know it's the next player's turn
    view.setTurnIndicator(store.game.currentPlayer);
  });
}

window.addEventListener("load", init);
