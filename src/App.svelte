<script>
  import client from './gql/client';
  import { setClient, subscribe } from 'svelte-apollo';
  import gameStore from './stores/game';
  import CreateGame from './components/CreateGame.svelte';
  import JoinGame from './components/JoinGame.svelte'
  import Container from './components/common/Container.svelte';
  import { GAME_SUBSCRIPTION } from './gql';
  setClient(client);

  let gamesSubscription

  $: if ($gameStore.gameId) {
    const subscription = subscribe(GAME_SUBSCRIPTION, {
      variables: { gameId: $gameStore.gameId },
    });
    console.log('subscription is', subscription);
    gamesSubscription = subscription
  }

  $: console.log('game ssubceiotiot is', $gamesSubscription)
</script>

<main>
  <Container>
    {#if !$gameStore.gameId}
      <CreateGame />
      <JoinGame />
    {:else}{$gameStore.gameId}{/if}
  </Container>
</main>
