<script>
  import gameStore from '../../stores/game';
</script>

<ol>
  {#each $gameStore.players as player}
    <li>{player.name}</li>
  {/each}
</ol>
