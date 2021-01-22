<script>
  import { mutation } from 'svelte-apollo';
  import { LYNCH_PLAYER } from '../../gql';
  import playerStore from '../../stores/player';
  import gameStore from '../../stores/game';
  import Button from '../common/Button.svelte';

  const lynchPlayer = mutation(LYNCH_PLAYER);

  let lynchingResult;

  const handleLynchPlayer = async (playerToLynchId) => {
    playerStore.update((store) => ({ ...store, isNominating: true }));
     await lynchPlayer({
      variables: {
        playerToLynchId,
        nominatedById: $playerStore._id,
        gameId: $gameStore.gameId,
      },
    });
    lynchingResult = `You've nominated ${$playerStore.playerToLynch.name} to be lynched`;
  };
</script>

{#if $playerStore.playerToLynch.name && !lynchingResult}
  <Button onClick={() => handleLynchPlayer($playerStore.playerToLynch._id)}>
    Lynch
    {$playerStore.playerToLynch.name}
  </Button>
{/if}
{#if lynchingResult}
  <p>{lynchingResult}</p>
{/if}
