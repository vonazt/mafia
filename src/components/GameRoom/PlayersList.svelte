<script>
  import { mutation } from 'svelte-apollo';
  import { NOMINATE_PLAYER_FOR_ASSASSINATION } from '../../gql';
  import gameStore from '../../stores/game';
  import playerStore from '../../stores/player';
  import { MAFIA_AWAKE, MAFIA } from '../../constants';

  const nominatePlayerForAssassination = mutation(
    NOMINATE_PLAYER_FOR_ASSASSINATION,
  );

  const handleNominate = {
    [MAFIA_AWAKE]: (playerToNominate) =>
      nominateForAssassination(playerToNominate),
  };

  const nominateForAssassination = async (playerToNominate) => {
    await nominatePlayerForAssassination({
      variables: {
        playerId: playerToNominate._id,
        mafiaHitmanId: $playerStore._id,
        gameId: $gameStore.gameId,
      },
    });
  };

  const canNominate = (player, currentPlayerRole) => {
    return (
      player.isAlive &&
      currentPlayerRole === MAFIA &&
      $gameStore.stage === MAFIA_AWAKE
      //  ||
      // (thisPlayer.role === `detective` &&
      //   thisPlayer.isAlive &&
      //   stages.detectiveAwake &&
      //   !investigating) ||
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
      {#if canNominate(player, $playerStore.role)}
        <input
          type="radio"
          value={player}
          on:click={() => {
            handleNominate[$gameStore.stage](player);
          }} />
      {/if}
      <li>{player.name}</li>
    {/each}
  </ol>
</div>
