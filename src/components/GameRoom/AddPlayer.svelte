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
    const savedPlayer = JSON.parse(window.sessionStorage.getItem(`player`));
    console.log('saved player is', savedPlayer);
    const playerToAdd =
      savedPlayer && savedPlayer.name === playerName
        ? { name: savedPlayer.name, _id: savedPlayer._id }
        : { name: playerName };
    const {
      data: {
        addPlayer: { players },
      },
    } = await addPlayer({
      variables: { gameId: $gameStore.gameId, player: playerToAdd },
    });

    const { _id } = players.find(({ name }) => name === playerName);
    window.sessionStorage.setItem(
      `player`,
      JSON.stringify({ name: playerName, _id }),
    );
    window.sessionStorage.setItem(`gameId`, $gameStore.gameId);
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
