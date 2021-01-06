<script>
  import gameStore from '../../stores/game';
</script>

<div class="w-3/12 text-right">
  {#if $gameStore.players.length}
    <h2>Players in the game:</h2>
  {/if}
  <ol>
    {#each $gameStore.players as player}
      <li>{player.name}</li>
    {/each}
  </ol>
</div>
