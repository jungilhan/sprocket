<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let text: string | undefined = undefined;
  export let disabled: boolean = false;
  export let className: string = '';

  const dispatch = createEventDispatcher();
</script>

<button
  type="button"
  disabled={disabled}
  on:click={(e) => {
    e.stopPropagation();
    dispatch('click');
  }}
  class={`min-w-[40px] min-h-[40px] inline-flex items-center justify-center px-4 py-2 rounded border border-white/20 bg-white/10 hover:bg-white/20 transition-all text-white shadow-md backdrop-blur-md disabled:opacity-50 disabled:cursor-not-allowed w-18 ${className}`}
  {...$$restProps}
>
  <slot>{#if text}{text}{/if}</slot>
</button>
