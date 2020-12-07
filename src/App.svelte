<script>
  import client from './gql/client';
  import { setClient, mutation } from 'svelte-apollo';
  import { CREATE_GAME } from './gql';
  setClient(client);

  const createGame = mutation(CREATE_GAME);
  const handleCreate = async () => {
    const game = await createGame();
    console.log('GAME IS ', game);
  };
</script>


<main>
  <div class="container mx-auto bg-gray-100 h-full">
    <p class="text-green-500">here</p>
  </div>
</main>
