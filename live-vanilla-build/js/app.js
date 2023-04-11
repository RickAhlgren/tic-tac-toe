import Store from "./store.js";
import View from "./view.js";

const App = {
  // All of our selected HTML elements
  $: {
    menu: document.querySelector('[data-id="menu"]'),
    menuItems: document.querySelector('[data-id="menu-items"]'),
    resetBtn: document.querySelector('[data-id="reset-btn"]'),
    newRoundBtn: document.querySelector('[data-id="new-round-btn"]'),
    squares: document.querySelectorAll('[data-id="square"]'),
    modal: document.querySelector('[data-id="modal"]'),
    modalText: document.querySelector('[data-id="modal-text"]'),
    modalBtn: document.querySelector('[data-id="modal-btn"]'),
    turn: document.querySelector('[data-id="turn"]'),
  },

  state: {
    moves: [],
  },

  getGameStatus(moves) {
    const p1Moves = moves
      .filter((move) => move.playerId === 1)
      .map((move) => +move.squareId);
    const p2Moves = moves
      .filter((move) => move.playerId === 2)
      .map((move) => +move.squareId);

    console.log(p1Moves);

    // The list of victory conditions
    const winningPatterns = [
      [1, 2, 3],
      [1, 5, 9],
      [1, 4, 7],
      [2, 5, 8],
      [3, 5, 7],
      [3, 6, 9],
      [4, 5, 6],
      [7, 8, 9],
    ];

    let winner = null;

    winningPatterns.forEach((pattern) => {
      const p1Wins = pattern.every((v) => p1Moves.includes(v));
      const p2Wins = pattern.every((v) => p2Moves.includes(v));

      if (p1Wins) winner = 1;
      if (p2Wins) winner = 2;
    });

    return {
      status: moves.length === 9 || winner != null ? "complete" : "in-progress",
      winner, // 1 | 2 | null
    };
  },

  init() {
    App.registerEventListeners();
  },

  registerEventListeners() {
    // DONE
    App.$.menu.addEventListener("click", (event) => {
      App.$.menuItems.classList.toggle("hidden");
    });

    // TODO
    App.$.resetBtn.addEventListener("click", (event) => {
      console.log("Reset the game");
    });

    // TODO
    App.$.newRoundBtn.addEventListener("click", (event) => {
      console.log("Start a new round");
    });

    // TODO
    App.$.modalBtn.addEventListener("click", (event) => {
      App.state.moves = [];
      App.$.squares.forEach((square) => square.replaceChildren());
      App.$.modal.classList.add("hidden");
    });

    // This event listener checks if a square has a play or not before
    // inserting the current player's play, then it adds the play to
    // that player's list (array) of plays, and then it checks to see
    // if that play resulted in a tie or victory for the current player
    App.$.squares.forEach((square) => {
      square.addEventListener("click", (event) => {
        // Check if square has a play already, return early
        const hasMove = (squareId) => {
          const existingMove = App.state.moves.find(
            (move) => move.squareId === squareId
          );
          return existingMove !== undefined;
        };

        // If the current square has a play already, the function
        // returns early, preventing the move from completing and
        // retaining the current player's turn
        if (hasMove(+square.id)) {
          return;
        }

        // Determine which player icon to add to the square
        const lastMove = App.state.moves.at(-1);
        const getOppositePlayer = (playerId) => (playerId === 1 ? 2 : 1);
        const currentPlayer =
          App.state.moves.length === 0
            ? 1
            : getOppositePlayer(lastMove.playerId);
        const nextPlayer = getOppositePlayer(currentPlayer);

        const squareIcon = document.createElement("i");
        const turnIcon = document.createElement("i");
        const turnLabel = document.createElement("p");
        turnLabel.innerText = `Player ${nextPlayer}, you are up!`;

        // Create an icon to represent the current player's move
        if (currentPlayer === 1) {
          squareIcon.classList.add("fa-solid", "fa-x", "yellow");
          turnIcon.classList.add("fa-solid", "fa-o", "turquoise");
          turnLabel.classList = "turquoise";
        } else {
          squareIcon.classList.add("fa-solid", "fa-o", "turquoise");
          turnIcon.classList.add("fa-solid", "fa-x", "yellow");
          turnLabel.classList = "yellow";
        }

        App.$.turn.replaceChildren(turnIcon, turnLabel);

        // Add the move to the list of moves for the current player,
        // to verify against victory conditions
        App.state.moves.push({
          squareId: +square.id,
          playerId: currentPlayer,
        });

        console.log(App.state);

        // Add icon to square
        square.replaceChildren(squareIcon);

        // Check if there is a winner or tie based on recent move
        const game = App.getGameStatus(App.state.moves);

        let message = "";
        if (game.status === "complete") {
          if (game.winner) {
            message = `Player ${game.winner} wins!`;
            App.$.modal.classList.remove("hidden");
          } else {
            message = "Tie game!";
          }

          App.$.modalText.textContent = message;
        }
      });
    });
  },
};

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
  const store = new Store(players);

  view.bindGameResetEvent((event) => {
    view.closeAll();

    // This resets the state to the initial state
    store.reset();

    // This clears the gameboard and resets the current player to Player 1
    view.clearMoves();
    view.setTurnIndicator(store.game.currentPlayer);

    view.updateScoreBoard(
      store.stats.playerWithStats[0].wins,
      store.stats.playerWithStats[1],
      store.stats.ties
    );

    // Update the score board by checking the player stats at the end of
    // a round. If a player doesn't have any wins, return a zero. Same
    // for ties.
    view.updateScoreBoard(
      store.stats.playerWithStats[0].wins,
      store.stats.playerWithStats[1].wins,
      store.stats.ties
    );
  });

  view.bindNewRoundEvent((event) => {
    console.log("New round event");
    console.log(event);
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

// RESUME @ 4:52:00
