<script>
  import { mutation, query } from 'svelte-apollo';
  import { INVESTIGATE_PLAYER, END_DETECTIVE_TURN } from '../../gql';
  import Button from '../common/Button.svelte';
  import detectiveStore from '../../stores/detective';
  import gameStore from '../../stores/game';

  const investigatePlayer = query(INVESTIGATE_PLAYER, {
    variables: { _id: `` },
  });

  const endDetectiveTurn = mutation(END_DETECTIVE_TURN);

  let investigationResult;

  const handleInvestigatePlayer = async (_id) => {
    detectiveStore.update((store) => ({ ...store, isInvestigating: true }));
    const {
      data: { investigatePlayer: isMafia },
    } = await investigatePlayer.refetch({ _id });

    investigationResult = `${$detectiveStore.playerToInvestigate.name} ${
      isMafia ? `is` : `is not`
    } a member of the mafia`;
  };

  const handleEndDetectiveTurn = async () => {
    await endDetectiveTurn({ variables: { gameId: $gameStore.gameId } });
  };
</script>

{#if $detectiveStore.playerToInvestigate.name && !investigationResult}
  <Button
    onClick={() => handleInvestigatePlayer($detectiveStore.playerToInvestigate._id)}>
    Investigate
    {$detectiveStore.playerToInvestigate.name}
  </Button>
{/if}
{#if investigationResult}
  <p>{investigationResult}</p>
  <Button onClick={handleEndDetectiveTurn}>OK</Button>
{/if}
