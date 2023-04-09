const initialValue = {
  moves: [],
};

export default class Store {
  #state = initialValue;

  constructor(players) {
    this.players = players;
  }

  get game() {
    const state = state.#getState();

    // using the modulus operator % results in 0 or 1 based on the number
    // of moves, so a 0 will be player 1 and 1 will be player 2
    const currentPlayer = this.players[state.moves.length % 2];

    return {
      currentPlayer,
    };
  }

  playerMove(squareId) {
    const state = this.#getState;

    // create a clone of the current state to avoid mutating the state itself
    const stateClone = structuredClone(state);

    stateClone.moves.push({
      squareId,
      player: this.game.currentPlayer,
    });

    this.#saveState(stateClone);
  }

  #getState() {
    return this.#state;
  }

  #saveState(stateOrFn) {
    const prevState = this.#getState();

    let newState;

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
