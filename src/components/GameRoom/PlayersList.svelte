<script>
  import { mutation } from 'svelte-apollo';
  import {
    NOMINATE_PLAYER_FOR_ASSASSINATION,
    NOMINATE_PLAYER,
  } from '../../gql';
  import gameStore from '../../stores/game';
  import playerStore from '../../stores/player';
  import detectiveStore from '../../stores/detective';
  import guardianAngelStore from '../../stores/guardianAngel';
  import {
    MAFIA_AWAKE,
    MAFIA,
    DETECTIVE,
    GUARDIAN_ANGEL,
    GUARDIAN_ANGEL_AWAKE,
    DETECTIVE_AWAKE,
    DAY,
  } from '../../constants';

  const nominatePlayerForAssassination = mutation(
    NOMINATE_PLAYER_FOR_ASSASSINATION,
  );

  const nominatePlayer = mutation(NOMINATE_PLAYER);

  const handleNominate = {
    [MAFIA_AWAKE]: (playerToNominate) =>
      nominateForAssassination(playerToNominate),
    [DETECTIVE_AWAKE]: (playerToInvestigate) =>
      detectiveStore.update((store) => ({ ...store, playerToInvestigate })),
    [GUARDIAN_ANGEL_AWAKE]: (playerToProtect) =>
      guardianAngelStore.update((store) => ({ ...store, playerToProtect })),
    [DAY]: (playerToNominate) => handleNominatePlayer(playerToNominate),
  };

  const handleNominatePlayer = async (player) => {
    playerToNominate = { ...player };
    await nominatePlayer({
      variables: {
        playerToNominateId: player._id,
        nominatedById: $playerStore._id,
        gameId: $gameStore.gameId,
      },
    });
  };

  let playerToNominate = {};

  const nominateForAssassination = async (player) => {
    playerToNominate = { ...player };
    await nominatePlayerForAssassination({
      variables: {
        playerId: player._id,
        mafiaHitmanId: $playerStore._id,
        gameId: $gameStore.gameId,
      },
    });
  };

  const canNominate = (
    player,
    currentPlayerRole,
    detectiveIsInvestigating,
    guardianAngelProtecting,
  ) => {
    return (
      player.isAlive &&
      ((currentPlayerRole === MAFIA && $gameStore.stage === MAFIA_AWAKE) ||
        (currentPlayerRole === DETECTIVE &&
          $gameStore.stage === DETECTIVE_AWAKE &&
          !detectiveIsInvestigating) ||
        (currentPlayerRole === GUARDIAN_ANGEL &&
          $gameStore.stage === GUARDIAN_ANGEL_AWAKE &&
          !guardianAngelProtecting) ||
        ($gameStore.stage === DAY && player.isAlive && $playerStore.isAlive))
      // ||
      // (!nominating &&
      //   thisPlayer.isAlive &&
      //   stages.twoNominations &&
      //   nominatedPlayers.some(({ _id }) => _id === player._id))
    );
  };

  const getNominatedBy = (nominatedBy) => {
    const nominators = nominatedBy
      .filter(({ _id }) => _id !== $playerStore._id)
      .map(({ name }) => name);
    return nominators.length ? `Nominated by ${nominators.join(`, `)}` : ``;
  };
</script>

<div class="w-3/12 text-right">
  {#if $gameStore.players.length}
    <h2>Players in the game:</h2>
  {/if}
  <ol>
    {#each $gameStore.players as player}
      {#if canNominate(player, $playerStore.role, $detectiveStore.isInvestigating, $guardianAngelStore.isProtecting)}
        <input
          type="radio"
          bind:group={playerToNominate}
          value={player}
          on:click={() => {
            handleNominate[$gameStore.stage](player);
          }} />
      {/if}
      <li class={`${!player.isAlive ? `line-through` : ``}`}>{player.name}</li>
      {#if player.nominatedBy.length && (($playerStore.role === MAFIA && $gameStore.stage === MAFIA_AWAKE) || $gameStore.stage === DAY)}
        {getNominatedBy(player.nominatedBy)}
      {/if}
    {/each}
  </ol>
</div>
