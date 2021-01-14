<script>
  import { CIVILIAN, DETECTIVE, MAFIA, GUARDIAN_ANGEL } from '../../constants';

  import gameStore from '../../stores/game';
  import playerStore from '../../stores/player';

  const roleDictionary = {
    [CIVILIAN]: `civilian`,
    [MAFIA]: `mafia`,
    [DETECTIVE]: `detective`,
    [GUARDIAN_ANGEL]: `guardian angel`,
  };

  export const getRole = (player) =>
    player.isAlive
      ? `Your role: ${roleDictionary[player.role]}`
      : `You are DEAD. Remember: dead men (and women) tell no tales`;
</script>

<div class="flex flex-wrap w-6/12">
  <div class="w-full">
    <h1 class="text-xl text-center">You are in game {$gameStore.gameId}</h1>
  </div>
  {#if $playerStore.role}
    <div class="w-full">
      <h2 class="text-xl text-center">Welcome, {$playerStore.name}</h2>
      <h2 class="text-xl text-center">{getRole($playerStore)}</h2>
    </div>
  {/if}
</div>
