<script>
  import { query } from 'svelte-apollo';
  import { INVESTIGATE_PLAYER } from '../../gql';
  import Button from '../common/Button.svelte';
  import detectiveStore from '../../stores/detective';

  const investigatePlayer = query(INVESTIGATE_PLAYER, {
    variables: { _id: `` },
  });

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
{/if}
