import { writable } from 'svelte/store';

const gameStore = writable({
  gameId: ``,
  stage: ``,
  players: [],
  nominatedPlayers: [],
});

export default gameStore;
