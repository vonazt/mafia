<script>
  import gameStore from '../../stores/game';
  import { MAFIA_AWAKE, INTRO } from '../../constants';

  const stageDescriptions = {
    [INTRO]: ``,
    [MAFIA_AWAKE]: `Night falls on the city. The mafia awake and select a citizen to "take care of"`,
  };
</script>

<div class="w-full mt-5">
  <h3 class="text-center ">{stageDescriptions[$gameStore.stage]}</h3>
</div>
