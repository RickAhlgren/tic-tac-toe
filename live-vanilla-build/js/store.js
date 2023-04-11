const initialValue = {
  currentGameMoves: [],
  history: {
    currentRoundGames: [],
    allGames: [],
  },
};

export default class Store {
  #state = initialValue;

  constructor(players) {
    this.players = players;
  }

  get stats() {
    const state = this.#getState();

    return {
      // Check the current player against the status of the current game
      // then get the length of that array to determine number of wins for
      // the current player
      playerWithStats: this.players.map((player) => {
        const wins = state.history.currentRoundGames.filter(
          (game) => game.status.winner?.id === player.id
        ).length;

        return {
          ...player,
          wins,
        };
      }),
      // Check the current game if there is a tie
      ties: state.history.currentRoundGames.filter(
        (game) => game.status.winner === null
      ).length,
    };
  }

  // Retrieve the current state of the game
  get game() {
    const state = this.#getState();

    // Using the modulus operator % results in 0 or 1 based on the number
    // of moves, so a 0 will be player 1 and 1 will be player 2
    const currentPlayer = this.players[state.currentGameMoves.length % 2];

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

    // Loop through the current player's move set and determine if
    // the current player has a winning configuration
    for (const player of this.players) {
      const selectedSquareIds = state.currentGameMoves
        .filter((move) => move.player.id === player.id)
        .map((move) => move.squareId);

      // Compare the current player's moves with the winning
      // movesets to see if the current player is a winner
      for (const pattern of winningPatterns) {
        if (pattern.every((v) => selectedSquareIds.includes(v))) {
          winner = player;
        }
      }
    }

    // Return the current state of the game board and whether
    // the game is complete or not
    return {
      moves: state.currentGameMoves,
      currentPlayer,
      status: {
        isComplete: winner != null || state.currentGameMoves.length === 9,
        winner,
      },
    };
  }

  playerMove(squareId) {
    // Create a clone of the current state to avoid mutating the state itself
    const stateClone = structuredClone(this.#getState());

    stateClone.currentGameMoves.push({
      squareId,
      player: this.game.currentPlayer,
    });

    this.#saveState(stateClone);
  }

  // This resets the game board to empty
  reset() {
    const stateClone = structuredClone(this.#getState());

    const { status, moves } = this.game;

    // If the game is complete, push the list of moves and the status of the
    // game into the history object under the currentRoundGames key
    if (status.isComplete) {
      stateClone.history.currentRoundGames.push({
        moves,
        status,
      });
    }

    // Reset the current game moves to an empty array
    stateClone.currentGameMoves = [];

    this.#saveState(stateClone);
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
