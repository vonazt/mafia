<script>
  import { subscribe } from 'svelte-apollo';
  import { PLAYER_SUBSCRIPTION } from '../../gql';
  import { DETECTIVE, DETECTIVE_AWAKE, INTRO, MAFIA, MAFIA_AWAKE } from '../../constants';
  import {
    AddPlayer,
    Header,
    PlayersList,
    StartGame,
    StageDescription,
    ConfirmAssassination,
    RejoinPlayer,
    InvestigatePlayer
  } from './';
  import playerStore from '../../stores/player';
  import gameStore from '../../stores/game';

  let hasJoined = false;
  const joined = () => {
    hasJoined = true;
  };

  const getSavedPlayer = () =>
    JSON.parse(window.sessionStorage.getItem(`player`));

  const getSavedGameId = () => window.sessionStorage.getItem(`gameId`);

  const getSavedPlayerId = () => {
    const player = getSavedPlayer();
    return player ? player._id : null;
  };

  let playerSubscription;
  let playerId = getSavedPlayerId();

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

  //TODO: WHEN DETECTIVE TURN IS OVER KILL PLAYER BASED ON LAST PLAYER KILLED
</script>

<div class="flex flex-wrap w-full h-full content-start pt-5">
  <Header />
  <PlayersList />
  {#if $gameStore.stage === INTRO}
    <StartGame />
  {/if}
  {#if (!hasJoined && $gameStore.stage === INTRO && !playerId) || (playerId && $gameStore.gameId !== getSavedGameId())}
    <AddPlayer {joined} {setPlayerId} />
  {/if}
  {#if !hasJoined && playerId && $gameStore.gameId === getSavedGameId()}
    <RejoinPlayer
      {joined}
      player={getSavedPlayer()}
      gameId={$gameStore.gameId} />
  {/if}
  <StageDescription />
  {#if $gameStore.nominatedPlayers.length && $gameStore.stage === MAFIA_AWAKE && $playerStore.role === MAFIA}
    <ConfirmAssassination />
  {/if}
  {#if $gameStore.stage === DETECTIVE_AWAKE && $playerStore.role === DETECTIVE}
  <InvestigatePlayer />
  {/if}
</div>
