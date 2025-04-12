<script lang="ts">
  import { clickOutside } from './clickOutside';
  import { createEventDispatcher } from 'svelte';
  import NoSleep from 'nosleep.js';

  export let wakeLockSupported: boolean = false;
  export let steps: { name: string; duration: number; description: string }[] = [];
  export let applyTwoPercentRule: boolean = false;
  export let rollNumber: number = 1;
  export let solutionVolume: '500' | '1000' = '1000';
  export let keepScreenOn: boolean = true;

  let nosleep = new NoSleep();
  const dispatch = createEventDispatcher();

  function addStep() {
    steps = [...steps, { name: 'New Step', duration: 60, description: '' }];
    saveSteps();
  }

  function removeStep(index: number) {
    steps = steps.filter((_, i) => i !== index);
    saveSteps();
  }

  function updateStep(
    index: number,
    key: 'name' | 'duration' | 'description',
    value: string | number
  ) {
    steps = steps.map((step, i) =>
      i === index ? { ...step, [key]: key === 'duration' ? Number(value) : value } : step
    );
    dispatch('update', { steps });
  }

  function saveSteps() {
    dispatch('update', { steps });
  }

  function resetSteps() {
    // Reset steps to initial values
    steps = [
      {
        name: 'Pre-Soak',
        duration: 60,
        description: 'Soak the film in water at developer temperature for 1 minute with no agitation',
      },
      {
        name: 'Developer',
        duration: 210,
        description:
          'Develop the film at 102°F (39°C) for 3.5 minutes, agitating continuously for the first 10 seconds, then 4 lifts every 30 seconds.',
      },
      {
        name: 'Bleach & Fix',
        duration: 480,
        description:
          'Bleach and fix the film at 75°F - 105°F (24°C - 40°C) for 8 minutes, agitating as per the Developer step.',
      },
      {
        name: 'Wash',
        duration: 180,
        description:
          'Wash the film in running water or by filling and emptying the tank 7 times for 3 minutes at 75°F - 105°F (24°C - 40°C).',
      },
      {
        name: 'Stabilizer',
        duration: 60,
        description:
          'Stabilize the film for 0.5 to 1 minute at room temperature, agitating for the first 15 seconds.',
      },
    ];
    saveSteps();
  }

  function enableNoSleep(newKeepScreenOn:boolean) {
    if (newKeepScreenOn) {
      nosleep.enable();
    } else {
      nosleep.disable()
    }
  }

  $: dispatch('updateRule', { applyTwoPercentRule });
  $: dispatch('updateRoll', { rollNumber });
  $: dispatch('updateVolume', { solutionVolume });
</script>


<div class="backdrop-blur-md border-white/20 bg-white/10 border px-4 py-6 p-6 md:p-6 rounded-3xl shadow-2xl space-y-4 max-w-md mx-auto">
  <!-- 2% Rule Section -->
  <div class="space-y-4 px-4">
    <h2 class="text-lg font-semibold text-white text-center">Weakened Developer Solution</h2>

    <!-- Apply Checkbox -->
    <div class="flex items-center justify-between">
      <label for="apply2Percent" class="text-white text-sm">Apply 2% Rule</label>
      <input
        id="apply2Percent"
        type="checkbox"
        bind:checked={applyTwoPercentRule}
        class="toggle bg-transparent checked:bg-transparent w-10 h-5"
      />
    </div>

    <!-- Solution Volume Selection -->
    <div
    class="flex items-center justify-between"
    class:opacity-50={!applyTwoPercentRule}
    class:pointer-events-none={!applyTwoPercentRule}
  >
    <p class="text-white text-sm">Solution Volume</p>
    <div class="flex items-center gap-4">
      <label class="flex items-center gap-2 text-white text-sm">
        <input
          type="radio"
          name="solutionVolume"
          value="500"
          class="radio bg-transparent checked:bg-transparent"
          bind:group={solutionVolume}
          on:change={() => dispatch('updateVolume', { solutionVolume })}
        />
        500ml
      </label>
      <label class="flex items-center gap-2 text-white text-sm">
        <input
          type="radio"
          name="solutionVolume"
          value="1000"
          class="radio bg-transparent checked:bg-transparent"
          bind:group={solutionVolume}
          on:change={() => dispatch('updateVolume', { solutionVolume })}
        />
        1000ml
      </label>
    </div>
  </div>

    <!-- Roll Number Input -->
    <div
      class="flex items-center justify-between"
      class:opacity-50={!applyTwoPercentRule}
      class:pointer-events-none={!applyTwoPercentRule}
    >
      <label for="rollNumber" class="text-white text-sm">Roll number</label>
      <input
        id="rollNumber"
        type="number"
        min="1"
        bind:value={rollNumber}
        class="bg-white/10 text-white text-sm px-3 py-1 rounded-md border border-white/20 w-24 text-left transition-opacity duration-300"
        on:input={(e) => {
          const input = e.target as HTMLInputElement;
          if (input.value === '' || Number(input.value) <= 0) {
            input.value = '1';
            rollNumber = 1;
          }
        }}
      />
    </div>
  </div>

   <!-- Keep Screen On Section -->
   <div class="space-y-4 px-4">
    <h2 class="text-lg font-semibold text-white text-center">Display Settings</h2>

    <!-- Keep Screen On Toggle -->
    <div class="flex items-center justify-between">
      <label for="keepScreenOn" class="text-white text-sm">Keep Screen On</label>
      <input
        id="keepScreenOn"
        type="checkbox"
        bind:checked={keepScreenOn}
        on:click={() => {
          keepScreenOn = !keepScreenOn;
          enableNoSleep(keepScreenOn);
        }}
        class="toggle bg-transparent checked:bg-transparent w-10 h-5"
        on:change={() => dispatch('updateKeepScreenOn', { keepScreenOn })}
      />
    </div>
    {#if wakeLockSupported}
      <p class="text-white text-center text-xs opacity-70">Wake Lock supported</p>
    {/if}
  </div>

  <!-- Step Settings -->
  <h2 class="text-lg font-semibold text-white">Step Settings</h2>

  <div class="space-y-3">
    {#each steps as step, i}
      <div class="flex items-center gap-3">
        <input
          type="text"
          bind:value={step.name}
          class="bg-white/10 text-white border border-white/20 rounded px-2 py-1 text-sm w-22"
          on:input={(e) => updateStep(i, 'name', e.currentTarget.value)}
        />
        <input
          type="number"
          min="1"
          bind:value={step.duration}
          class="bg-white/10 text-white border border-white/20 rounded px-2 py-1 text-sm w-16"
          on:input={(e) => updateStep(i, 'duration', e.currentTarget.value)}
        />
        <input
          type="text"
          bind:value={step.description}
          class="bg-white/10 text-white border border-white/20 rounded px-2 py-1 text-sm w-30"
          on:input={(e) => updateStep(i, 'description', e.currentTarget.value)}
        />

        <!-- Remove Step button -->
        <button
          on:click={() => removeStep(i)}
          class="rounded px-2 py-1 text-white bg-white/10 border border-white/20 hover:bg-white/20 transition-colors text-sm"
          disabled={steps.length === 1}
        >
          ✕
        </button>
      </div>
    {/each}
  </div>

  <div class="flex justify-center gap-3">
    <button
      class="rounded px-4 py-2 text-white bg-white/10 border border-white/20 hover:bg-white/20 transition-colors text-sm"
      on:click={addStep}
    >
      Add Step
    </button>

    <button
      class="rounded px-4 py-2 text-white bg-white/10 border border-white/20 hover:bg-white/20 transition-colors text-sm"
      on:click={resetSteps}
    >
      Reset Steps
    </button>
  </div>
</div>
