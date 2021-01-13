<script>
  import { mutation } from 'svelte-apollo';
  import { NOMINATE_PLAYER_FOR_ASSASSINATION } from '../../gql';
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
  } from '../../constants';

  const nominatePlayerForAssassination = mutation(
    NOMINATE_PLAYER_FOR_ASSASSINATION,
  );

  const handleNominate = {
    [MAFIA_AWAKE]: (playerToNominate) =>
      nominateForAssassination(playerToNominate),
    [DETECTIVE_AWAKE]: (playerToInvestigate) =>
      detectiveStore.update((store) => ({ ...store, playerToInvestigate })),
    [GUARDIAN_ANGEL_AWAKE]: (playerToProtect) =>
      guardianAngelStore.update((store) => ({ ...store, playerToProtect })),
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
          !guardianAngelProtecting))
      // ||
      // (stages.day && player.isAlive && thisPlayer.isAlive) ||
      // (!nominating &&
      //   thisPlayer.isAlive &&
      //   stages.twoNominations &&
      //   nominatedPlayers.some(({ _id }) => _id === player._id))
    );
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
      <li>{player.name}</li>
      {#if player.nominatedBy.length && $playerStore.role === MAFIA && $gameStore.stage === MAFIA_AWAKE}
        <span>Nominated by
          {#each player.nominatedBy as nominatingPlayer}
            {nominatingPlayer.name}
          {/each}</span>
      {/if}
    {/each}
  </ol>
</div>
