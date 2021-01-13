<script>
  import { mutation } from 'svelte-apollo';
  import Button from './common/Button.svelte';
  import { JOIN_GAME } from '../gql';
  import gameStore from '../stores/game';

  let gameId = '';
  const joinGame = mutation(JOIN_GAME);
  const handleJoin = async () => {
    const {
      data: { joinGame: updatedGame },
    } = await joinGame({ variables: { gameId } });
    gameStore.update((game) => ({ ...game, ...updatedGame }));
  };
</script>

<input class="border-black border-2 rounded" bind:value={gameId} />
<Button onClick={handleJoin}>Join</Button>
