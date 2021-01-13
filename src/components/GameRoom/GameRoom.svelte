<script>
  import { subscribe } from 'svelte-apollo';
  import { PLAYER_SUBSCRIPTION } from '../../gql';
  import { INTRO, MAFIA, MAFIA_AWAKE } from '../../constants';
  import {
    AddPlayer,
    Header,
    PlayersList,
    StartGame,
    StageDescription,
    ConfirmAssassination,
  } from './';
  import playerStore from '../../stores/player';
  import gameStore from '../../stores/game';

  let hasJoined = false;
  const joined = () => {
    hasJoined = true;
  };

  let playerSubscription;
  let playerId;

  const setPlayerId = (id) => (playerId = id);

  $: if (playerId) {
    const subscription = subscribe(PLAYER_SUBSCRIPTION, {
      variables: { _id: playerId },
    });
    playerSubscription = subscription;
  }

  $: if ($playerSubscription?.data?.updatedPlayer) {
    playerStore.update(() => $playerSubscription.data.updatedPlayer);
  }

  $: console.log('GAME STORE IN GAME ROOM IS', $gameStore)
</script>

<div class="flex flex-wrap w-full h-full content-start pt-5">
  <Header />
  <PlayersList />
  {#if $gameStore.stage === INTRO}
    <StartGame />
  {/if}
  {#if !hasJoined}
    <AddPlayer {joined} {setPlayerId} />
  {/if}
  <StageDescription />
  {#if $gameStore.nominatedPlayers.length && $gameStore.stage === MAFIA_AWAKE && $playerStore.role === MAFIA}
    <ConfirmAssassination />
  {/if}
</div>
