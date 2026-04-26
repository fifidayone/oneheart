<script lang="ts">
  import HeroSection from "$lib/components/home/HeroSection.svelte";
  import StorySection from "$lib/components/home/StorySection.svelte";
  import CollaborationSection from "$lib/components/home/CollaborationSection.svelte";
  import { homeMeta } from "$lib/content/home";
</script>

<svelte:head>
  <title>{homeMeta.title}</title>
  <meta name="description" content={homeMeta.description} />
  <meta property="og:title" content={homeMeta.ogTitle ?? homeMeta.title} />
  <meta
    property="og:description"
    content={homeMeta.ogDescription ?? homeMeta.description}
  />
  <meta property="og:type" content="website" />
</svelte:head>

<HeroSection />

<StorySection />
<CollaborationSection />
