<script>
  import { mutation } from 'svelte-apollo';
  import Button from './common/Button.svelte';
  import { JOIN_GAME } from '../gql';
  import gameStore from '../stores/game';

  let gameId = '';
  const joinGame = mutation(JOIN_GAME);
  const handleJoin = async () => {
    console.log('game id is', gameId);
    const {
      data: { joinGame: game },
    } = await joinGame({ variables: { gameId } });
    console.log('game is', game);
    gameStore.update(() => game);
  };
</script>

<input class="border-black border-2 rounded" bind:value={gameId} />
<Button onClick={handleJoin}>Join</Button>
