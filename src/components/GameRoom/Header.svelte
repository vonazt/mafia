<script>
  import gameStore from '../../stores/game';
  import playerStore from '../../stores/player';
</script>

<div class="flex flex-wrap w-6/12">
  <div class="w-full">
    <h1 class="text-xl text-center">You are in game {$gameStore.gameId}</h1>
  </div>
  {#if $playerStore.role}
    <div class="w-full">
      <h2 class="text-xl text-center">You are a {$playerStore.role}</h2>
    </div>
  {/if}
</div>
