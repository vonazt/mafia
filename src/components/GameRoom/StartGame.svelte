<script>
  import { mutation } from 'svelte-apollo';
  import gameStore from '../../stores/game';
  import Button from '../common/Button.svelte';
  import { START_GAME } from '../../gql';

  const startGame = mutation(START_GAME);

  const handleStart = async () => {
    await startGame({ variables: { gameId: $gameStore.gameId } });
  };
</script>

<div class="w-3/12 text-right">
  {#if $gameStore.players.length < 6}
    Waiting for players...
  {:else}
    <Button onClick={handleStart}>Start game</Button>
  {/if}
</div>
