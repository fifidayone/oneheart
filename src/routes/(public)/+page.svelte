<script lang="ts">
  import HeroSection from "$lib/components/home/HeroSection.svelte";
  import ClientsMarquee from "$lib/components/home/ClientsMarquee.svelte";
  import StorySection from "$lib/components/home/StorySection.svelte";
  import CollaborationSection from "$lib/components/home/CollaborationSection.svelte";
</script>

<HeroSection />

<svelte:boundary>
  <ClientsMarquee />
  {#snippet failed(error, reset)}
    <div class="boundary-error">
      <p>Unable to load partners</p>
      <button onclick={reset}>Retry</button>
    </div>
  {/snippet}
</svelte:boundary>

<svelte:boundary>
  <StorySection />
  {#snippet failed(error, reset)}
    <div class="boundary-error">
      <p>Vision section error</p>
      <button onclick={reset}>Retry</button>
    </div>
  {/snippet}
</svelte:boundary>

<svelte:boundary>
  <CollaborationSection />
  {#snippet failed(error, reset)}
    <div class="boundary-error">
      <p>Collaboration details error</p>
      <button onclick={reset}>Retry</button>
    </div>
  {/snippet}
</svelte:boundary>

<style>
  .boundary-error {
    padding: 4rem 2rem;
    text-align: center;
    background: rgba(var(--color-text-rgb), 0.02);
    border: 1px solid rgba(var(--color-text-rgb), 0.1);
    color: rgba(var(--color-text-rgb), 0.5);
    font-family: var(--font-primary);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
  }

  .boundary-error button {
    background: none;
    border: 1px solid rgba(var(--color-text-rgb), 0.2);
    color: var(--color-text);
    padding: 0.5rem 1.5rem;
    cursor: pointer;
    text-transform: uppercase;
    font-size: 0.7rem;
    letter-spacing: 0.1em;
    transition: all 0.3s ease;
  }

  .boundary-error button:hover {
    background: var(--color-text);
    color: var(--color-bg);
  }
</style>
