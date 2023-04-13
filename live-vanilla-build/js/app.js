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

  // Create Event Listener that is listening for the "statechange"
  // event created at the end of the #saveState function in store.js
  // This is for when the current tab state changes
  store.addEventListener("statechange", () => {
    view.render(store.game, store.stats);
  });

  // This is for when a different tab state changes
  window.addEventListener("storage", () => {
    console.log("State changed from another tab");
    view.render(store.game, store.stats);
  });

  view.render(store.game, store.stats);

  view.bindGameResetEvent((event) => {
    // This resets the state to the initial state
    store.reset();
  });

  // Functionality for the New Round button.
  view.bindNewRoundEvent((event) => {
    store.newRound();
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

    // Advance to the next state by pushing a move to moves array
    // Sends id of clicked square to Store to track player move
    // clickedSquare.id will come through as a string by default,
    // so (+) transforms the value from a string to a number
    store.playerMove(+square.id);
  });
}

window.addEventListener("load", init);
