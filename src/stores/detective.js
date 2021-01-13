import { writable } from 'svelte/store';

const detectiveStore = writable({
  isInvestigating: false,
  playerToInvestigate: {},
});

export default detectiveStore;
