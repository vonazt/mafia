<script>
  import client from './gql/client';
  import { setClient, subscribe } from 'svelte-apollo';
  import gameStore from './stores/game';
  import CreateGame from './components/CreateGame.svelte';
  import JoinGame from './components/JoinGame.svelte';
  import Container from './components/common/Container.svelte';
  import GameRoom from './components/GameRoom/GameRoom.svelte';
  import { GAME_SUBSCRIPTION } from './gql';
  setClient(client);

  let gameSubscription;

  $: if ($gameStore.gameId) {
    const subscription = subscribe(GAME_SUBSCRIPTION, {
      variables: { gameId: $gameStore.gameId },
    });
    gameSubscription = subscription;
  }

  $: if ($gameSubscription?.data?.updatedGame) {
    gameStore.update((game) => ({
      ...game,
      ...$gameSubscription.data.updatedGame,
    }));
  }
  $: console.log('GAME STORE IN APP IS', $gameStore)
</script>

<main>
  <Container>
    {#if !$gameStore.gameId}
      <CreateGame />
      <JoinGame />
    {:else}
      <GameRoom />
    {/if}
  </Container>
</main>
