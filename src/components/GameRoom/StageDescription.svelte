<script>
  import gameStore from '../../stores/game';
  import { MAFIA_AWAKE, INTRO, DETECTIVE_AWAKE } from '../../constants';

  const stageDescriptions = {
    [INTRO]: ``,
    [MAFIA_AWAKE]: `Night falls on the city. The mafia awake and select a citizen to "take care of..."`,
    [DETECTIVE_AWAKE]: `Blood has been spilled. The mafia retreat to their hideout, and the detective investigates...`
  };
</script>

<div class="w-full mt-5">
  <h3 class="text-center ">{stageDescriptions[$gameStore.stage]}</h3>
</div>
