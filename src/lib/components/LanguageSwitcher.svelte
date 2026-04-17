<script lang="ts">
  export type LanguageOption = "en" | "th" | "tw";

  type Option = {
    code: LanguageOption;
    label: string;
    ariaLabel: string;
  };

  const options: Option[] = [
    { code: "en", label: "EN", ariaLabel: "Switch to English" },
    { code: "th", label: "TH", ariaLabel: "Switch to Thai" },
    { code: "tw", label: "TW", ariaLabel: "Switch to Traditional Chinese" },
  ];

  let {
    value = "en",
    onSelect,
  }: {
    value?: LanguageOption;
    onSelect?: (next: LanguageOption) => void;
  } = $props();

  function select(next: LanguageOption) {
    onSelect?.(next);
  }
</script>

<div class="language-switcher">
  <div class="language-switch-track">
    <div
      class={["slider", value]}
    ></div>

    {#each options as option (option.code)}
      <button
        type="button"
        class={value === option.code ? "active" : ""}
        aria-label={option.ariaLabel}
        onclick={() => select(option.code)}
      >
        {option.label}
      </button>
    {/each}
  </div>
</div>

<style>
  .language-switcher {
    display: inline-flex;
  }

  .language-switch-track {
    position: relative;
    display: flex;
    flex-direction: column;
    background: rgba(10, 10, 10, 0.4);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid var(--color-pearl-mist);
    box-shadow:
      inset 0 1px 1px rgba(var(--color-text-rgb), 0.05),
      0 10px 30px rgba(0, 0, 0, 0.5);
    border-radius: 4px;
    padding: 6px;
    gap: 4px;
    width: 48px;
  }

  .language-switch-track .slider {
    position: absolute;
    left: 4px;
    right: 4px;
    top: 4px;
    height: calc((100% - 8px) / 3);
    background: rgba(var(--color-text-rgb), 0.05);
    border: 1px solid rgba(var(--color-text-rgb), 0.2);
    border-radius: 2px;
    box-shadow:
      inset 0 1px 2px rgba(var(--color-text-rgb), 0.1),
      0 0 12px rgba(var(--color-text-rgb), 0.15);
    transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
    pointer-events: none;
    z-index: 1;
  }

  .slider.en {
    transform: translateY(0);
  }

  .slider.th {
    transform: translateY(100%);
  }

  .slider.tw {
    transform: translateY(200%);
  }

  .language-switch-track button {
    background: none;
    border: none;
    padding: 0.875rem 0;
    font-family: var(--font-primary);
    font-size: 0.7rem;
    font-weight: 500;
    letter-spacing: 0.15em;
    color: rgba(var(--color-text-rgb), 0.4);
    cursor: pointer;
    transition:
      color 0.4s ease,
      text-shadow 0.4s ease,
      outline-offset 0.2s ease;
    text-transform: uppercase;
    position: relative;
    z-index: 2;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 2px;
  }

  .language-switch-track button:focus-visible {
    outline: 2px solid var(--color-white);
    outline-offset: 2px;
    box-shadow: 0 0 15px rgba(var(--color-white-rgb), 0.4);
  }

  .language-switch-track button:hover {
    color: rgba(var(--color-text-rgb), 0.8);
  }

  .language-switch-track button.active {
    color: var(--color-text);
    font-weight: 600;
    text-shadow: 0 0 10px rgba(var(--color-white-rgb), 0.3);
  }

  @media (max-width: 1024px) {
    .language-switch-track {
      flex-direction: row;
      width: 180px;
      height: 40px;
      padding: 4px;
    }

    .language-switch-track .slider {
      top: 4px;
      bottom: 4px;
      left: 4px;
      right: auto;
      width: calc((100% - 8px) / 3);
      height: auto;
    }

    .slider.en {
      transform: translateX(0);
    }

    .slider.th {
      transform: translateX(100%);
    }

    .slider.tw {
      transform: translateX(200%);
    }

    .language-switch-track button {
      width: 100%;
      height: 100%;
      padding: 0;
      font-size: 0.65rem;
    }
  }
</style>
