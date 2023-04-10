const initialValue = {
  moves: [],
};

export default class Store {
  #state = initialValue;

  constructor(players) {
    this.players = players;
  }

  get game() {
    const state = this.#getState();

    // Using the modulus operator % results in 0 or 1 based on the number
    // of moves, so a 0 will be player 1 and 1 will be player 2
    const currentPlayer = this.players[state.moves.length % 2];

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

    for (const player of this.players) {
      const selectedSquareIds = state.moves
        .filter((move) => move.player.id === player.id)
        .map((move) => move.squareId);

      for (const pattern of winningPatterns) {
        if (pattern.every((v) => selectedSquareIds.includes(v))) {
          winner = player;
        }
      }
    }

    return {
      moves: state.moves,
      currentPlayer,
      status: {
        isComplete: winner != null || state.moves.length === 9,
        winner,
      },
    };
  }

  playerMove(squareId) {
    const state = this.#getState();

    // Create a clone of the current state to avoid mutating the state itself
    const stateClone = structuredClone(state);

    stateClone.moves.push({
      squareId,
      player: this.game.currentPlayer,
    });

    this.#saveState(stateClone);
  }

  // This resets the game board to empty
  reset() {
    console.log(this.#state);
    this.#saveState(initialValue);
    console.log(this.#state);
  }

  // Retrieve the current state
  #getState() {
    return this.#state;
  }

  // Save the current state
  #saveState(stateOrFn) {
    const prevState = this.#getState();

    let newState;

    // This switch function checks the argument being passed in to
    // see if it is a function or object. If it is a function,
    // the previous state is passed in as the argument for the
    // function. If it is an object, the object becomes the new state.
    switch (typeof stateOrFn) {
      case "function":
        newState = stateOrFn(prevState);
        break;
      case "object":
        newState = stateOrFn;
        break;
      default:
        throw new Error("Invalid argument passed to saveState");
    }

    this.#state = newState;
  }
}
