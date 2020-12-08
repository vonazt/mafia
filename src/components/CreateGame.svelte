<script>
  import Button from './common/Button.svelte';
  import { mutation } from 'svelte-apollo';
  import { CREATE_GAME} from '../gql';
  import gameStore from '../stores/game';

  const createGame = mutation(CREATE_GAME);
  const handleCreate = async () => {
    const {
      data: { create: game },
    } = await createGame();
    console.log('GAME IS ', game);
    gameStore.update(() => game);

  };
</script>

<Button onClick={handleCreate}>Create game</Button>
