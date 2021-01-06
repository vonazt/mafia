<script>
  import { mutation } from 'svelte-apollo';
  import { ADD_PLAYER } from '../../gql';
  import gameStore from '../../stores/game';

  import Button from '../common/Button.svelte';

  export let joined;
  export let setPlayerId;

  let playerName = '';
  const addPlayer = mutation(ADD_PLAYER);

  const handleAddPlayer = async () => {
    const {
      data: {
        addPlayer: { players },
      },
    } = await addPlayer({
      variables: { gameId: $gameStore.gameId, player: { name: playerName } },
    });

    console.log('players are', players);

    const { _id } = players.find(({ name }) => name === playerName);
    console.log('id is', _id);

    setPlayerId(_id);
    joined();
  };
</script>

<div class="w-full">
  <input class="border-black border-2 rounded p-3" bind:value={playerName} />
  <div class="w-full">
    <Button onClick={handleAddPlayer}>Join game</Button>
  </div>
</div>
