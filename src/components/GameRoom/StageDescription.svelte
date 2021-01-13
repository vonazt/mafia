<script>
  import gameStore from '../../stores/game';
  import { MAFIA_AWAKE, INTRO, DETECTIVE_AWAKE, GUARDIAN_ANGEL_AWAKE } from '../../constants';

  const stageDescriptions = {
    [INTRO]: ``,
    [MAFIA_AWAKE]: `Night falls on the city. The mafia awake and select a citizen to "take care of..."`,
    [DETECTIVE_AWAKE]: `Blood has been spilled. The mafia retreat to their hideout, and the detective investigates...`,
    [GUARDIAN_ANGEL_AWAKE]: `The detective has learnt something tonight. They return to the police station. The guardian angel awakes and chooses a person to save from death.`
  };
</script>

<div class="w-full mt-5">
  <h3 class="text-center ">{stageDescriptions[$gameStore.stage]}</h3>
</div>
