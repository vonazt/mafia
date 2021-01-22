import { writable } from 'svelte/store';

const playerStore = writable({ isNominating: false, playerToLynch: {} });

export default playerStore;
