<script>
	import io from 'socket.io-client';
	const socket = io()
  export let name;

  const handleSubmit = () => {
		console.log('sumbitted')
    socket.emit(`message`, `whyyyyy`);
  };
</script>

<style>
  main {
    text-align: center;
    padding: 1em;
    max-width: 240px;
    margin: 0 auto;
  }

  h1 {
    color: #ff3e00;
    text-transform: uppercase;
    font-size: 4em;
    font-weight: 100;
  }

  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }

	button {
		height: 20px;
		width: 60px;
	}
</style>

<main>
  <h1>Hello asahjaash {name}!</h1>
  <p>
    Visit the
    <a href="https://svelte.dev/tutorial">Svelte tutorial</a>
    to learn how to build Svelte apps.
  </p>
  <button on:click={handleSubmit}>Press me</button>
</main>
