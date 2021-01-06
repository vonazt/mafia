<script>
  import { subscribe } from 'svelte-apollo';
  import { PLAYER_SUBSCRIPTION } from '../../gql';
  import AddPlayer from './AddPlayer.svelte';
  import Header from './Header.svelte';
  import PlayersList from './PlayersList.svelte';
  import StartGame from './StartGame.svelte';
  import playerStore from '../../stores/player';

  let hasJoined = false;
  $: console.log('has joined is', hasJoined);
  const joined = () => {
    hasJoined = true;
  };

  let playerSubscription;
  let playerId;

  const setPlayerId = (id) => (playerId = id);

  $: console.log('player id is', playerId);

  $: if (playerId) {
    const subscription = subscribe(PLAYER_SUBSCRIPTION, {
      variables: { _id: playerId },
    });
    console.log('player sub is', subscription);
    playerSubscription = subscription;
  }

  $: console.log('play sub is', $playerSubscription);
  $: if ($playerSubscription?.data?.updatedPlayer) {
    playerStore.update(() => $playerSubscription.data.updatedPlayer);
  }
</script>

<div class="flex flex-wrap w-full h-full content-start pt-5">
  <Header />
  <PlayersList />
  <StartGame />
  {#if !hasJoined}
    <AddPlayer {joined} {setPlayerId} />
  {/if}
</div>
