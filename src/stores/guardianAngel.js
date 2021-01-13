import { writable } from 'svelte/store';

const guardianAngelStore = writable({
  isProtecting: false,
  playerToProtect: {},
});

export default guardianAngelStore;
