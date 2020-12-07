<script>
  import client from './gql/client';
  import { setClient, subscribe } from 'svelte-apollo';
  import gameStore from './stores/game';
  import CreateGame from './components/CreateGame.svelte';
  import Container from './components/common/Container.svelte';
  import { GAME_SUBSCRIPTION } from './gql';
  setClient(client);

  $: if ($gameStore.gameId) {
    const subscription = subscribe(GAME_SUBSCRIPTION, {
      variables: { gameId: $gameStore.gameId },
    });
    console.log('subscription is', subscription)
  }
</script>

<main>
  <Container>
    {#if !$gameStore.gameId}
      <CreateGame />
    {:else}{$gameStore.gameId}{/if}
  </Container>
</main>
