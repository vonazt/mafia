<script>
  import gameStore from '../../stores/game';
  import Button from '../common/Button.svelte';

  const confirmAssassination = (playerToAssassinate) => {
    console.log('will assasinate', playerToAssassinate);
  };

</script>

<p>
  {$gameStore.nominatedPlayers[0].name}
  will be sent to sleep with the fishes
</p>
<Button onClick={() => confirmAssassination($gameStore.nominatedPlayers[0])}>
  Confirm
</Button>
