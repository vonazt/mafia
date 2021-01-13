<script>
  import { mutation } from 'svelte-apollo';
  import { CONFIRM_ASSASSINATION } from '../../gql';
  import gameStore from '../../stores/game';
  import Button from '../common/Button.svelte';

  const confirmPlayerToAssassinate = mutation(CONFIRM_ASSASSINATION);
  const confirmAssassination = async (playerToAssassinate) => {
    await confirmPlayerToAssassinate({
      variables: {
        playerKilledId: playerToAssassinate._id,
        gameId: $gameStore.gameId,
      },
    });
  };
</script>

<p>
  {$gameStore.nominatedPlayers[0].name}
  will be sent to sleep with the fishes
</p>
<Button onClick={() => confirmAssassination($gameStore.nominatedPlayers[0])}>
  Confirm
</Button>
