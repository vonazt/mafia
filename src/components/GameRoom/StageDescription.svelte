<script>
  import gameStore from '../../stores/game';
  import {
    MAFIA_AWAKE,
    INTRO,
    DETECTIVE_AWAKE,
    GUARDIAN_ANGEL_AWAKE,
    DAY,
    TWO_NOMINATIONS,
    MAFIA
  } from '../../constants';

  const getDayDescription = (lastPlayerKilled) =>
    lastPlayerKilled
      ? `${lastPlayerKilled.name} has been tragically murdered in their sleep. The townsfolk gather to find the killers in their midst`
      : `A guardian angel saved someone from certain death last night. Nonetheless, the would-be killers are still at large. The townsfolk gather to try to find the killers in their midst...`;

  const stageDescriptions = {
    [INTRO]: () => ``,
    [MAFIA_AWAKE]: (game) =>
      game.lastPlayerKilled
        ? `${game.lastPlayerKilled.name} was strung up by the mob. They were ${
            game.lastPlayerKilled.role === MAFIA
              ? `a member of the mafia`
              : `not a member of the mafia`
          }. Night falls on the city. The mafia awake and select a citizen to "take care of..."`
        : `Night falls on the city. The mafia awake and select a citizen to "take care of..."`,
    [DETECTIVE_AWAKE]: () =>
      `Blood has been spilled. The mafia retreat to their hideout, and the detective investigates...`,
    [GUARDIAN_ANGEL_AWAKE]: () =>
      `The detective has learnt something tonight. They return to the police station. The guardian angel awakes and chooses a person to save from death.`,
    [DAY]: (game) => getDayDescription(game.lastPlayerKilled),
    [TWO_NOMINATIONS]: (game) => `${game.nominatedPlayers
      .map(({ name }) => name)
      .join(` and `)}
          have been accused by the townsfolk. One of them must die. Pick one.`,
  };
</script>

<div class="w-full mt-5">
  <h3 class="text-center ">
    {stageDescriptions[$gameStore.stage]($gameStore)}
  </h3>
</div>
