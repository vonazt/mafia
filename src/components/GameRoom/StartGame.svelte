<script>
  import gameStore from '../../stores/game';
  import Button from '../common/Button.svelte';

  const handleStart = () => {
    console.log('starting...');
  };
</script>

<div class="w-3/12 text-right">
  {#if $gameStore.players.length < 6}
    Waiting for players...
  {:else}
    <Button onClick={handleStart}>Start game</Button>
  {/if}
</div>
