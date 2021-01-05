<script>
  import { mutation } from 'svelte-apollo';
  import { ADD_PLAYER } from '../../gql';
  import gameStore from '../../stores/game';

  import Button from '../common/Button.svelte';

  let playerName = '';
  const addPlayer = mutation(ADD_PLAYER);
  const handleAddPlayer = async () => {
    await addPlayer({
      variables: { gameId: $gameStore.gameId, player: { name: playerName } },
    });
    // console.log('data is', data);
    // // gameStore.update(() => game);
  };
</script>

<input class="border-black border-2 rounded" bind:value={playerName} />
<Button onClick={handleAddPlayer}>Join game</Button>
