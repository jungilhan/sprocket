<script lang="ts">
  import StepTimer from './lib/StepTimer.svelte';
  import GlassButton from './lib/GlassButton.svelte';
  import SettingsPanel from './lib/SettingsPanel.svelte';
  import { clickOutside } from './lib/clickOutside';
  import { isMobileDevice } from './lib/types';
  import { Settings, X } from 'lucide-svelte';
  import NoSleep from 'nosleep.js';
  import { onMount } from 'svelte';

  const defaultSteps = [
    { name: 'Pre-Soak', duration: 60, description: 'Soak the film in water at developer temperature for 1 minute with no agitation' },
    { name: 'Developer', duration: 210, description: 'Develop the film at 102°F (39°C) for 3.5 minutes, agitating continuously for the first 10 seconds, then 4 lifts every 30 seconds.' },
    { name: 'Bleach & Fix', duration: 480, description: 'Bleach and fix the film at 75°F - 105°F (24°C - 40°C) for 8 minutes, agitating as per the Developer step.' },
    { name: 'Wash', duration: 180, description: 'Wash the film in running water or by filling and emptying the tank 7 times for 3 minutes at 75°F - 105°F (24°C - 40°C).' },
    { name: 'Stabilizer', duration: 60, description: 'Stabilize the film for 0.5 to 1 minute at room temperature, agitating for the first 15 seconds.' },
  ];

  let steps: { name: string; duration: number; description: string }[] = [...defaultSteps];
  let currentStep = 0;
  let isRunning = false;
  let showSettings = false;
  let timerRef: StepTimer | null = null;
  let applyTwoPercentRule: boolean = false;
  let rollNumber: number = 1;
  let solutionVolume: '500' | '1000' = '1000';
  let keepScreenOn: boolean = true;
  let nosleep: NoSleep = new NoSleep();
  let timerSize: number;

  // Dynamic size based on window size
  $: timerSize = window.innerWidth < 640 ? 240 : 380; // Example: 240px for mobile, 340px for desktop

  $: adjustedSteps = steps.map((step) => {
    if (step.name === 'Developer') {
      let multiplier = 1;
      if (applyTwoPercentRule) {
        multiplier *= Math.pow(1.02, rollNumber - 1);
      }
      if (solutionVolume === '500') {
        multiplier *= Math.pow(1.04, rollNumber-1); // 500ml일 경우 4% 추가
      }
      return {
        ...step,
        duration: Math.round(step.duration * multiplier),
      };
    }
    return step;
  });

  onMount(() => {
    const savedSteps = localStorage.getItem('film-timer-steps');
    if (savedSteps) {
      try {
        const parsedSteps = JSON.parse(savedSteps);
        if (Array.isArray(parsedSteps)) {
          steps = parsedSteps;
        }
      } catch (e) {
        console.error('Failed to parse saved steps:', e);
      }
    }
    const savedApplyTwoPercentRule = localStorage.getItem('film-timer-applyTwoPercentRule');
    if (savedApplyTwoPercentRule !== null) {
        applyTwoPercentRule = JSON.parse(savedApplyTwoPercentRule);
    }
    const savedRollNumber = localStorage.getItem('film-timer-rollNumber');
    if (savedRollNumber !== null) {
        rollNumber = JSON.parse(savedRollNumber);
    }
    const savedSolutionVolume = localStorage.getItem('film-timer-solutionVolume');
    if (savedSolutionVolume !== null) {
        solutionVolume = JSON.parse(savedSolutionVolume);
    }
    const savedKeepScreenOn = localStorage.getItem('film-timer-keepScreenOn');
    if (savedKeepScreenOn !== null) {
        keepScreenOn = JSON.parse(savedKeepScreenOn);
    } else {
      keepScreenOn = isMobileDevice();
    }    
  });
  
  function saveToLocalStorage() {
    localStorage.setItem('film-timer-steps', JSON.stringify(steps));
    localStorage.setItem('film-timer-applyTwoPercentRule', JSON.stringify(applyTwoPercentRule));
    localStorage.setItem('film-timer-rollNumber', JSON.stringify(rollNumber));
    localStorage.setItem('film-timer-solutionVolume', JSON.stringify(solutionVolume));
    localStorage.setItem('film-timer-keepScreenOn', JSON.stringify(keepScreenOn));
    console.log("saved to local storage")
  }

  function next() {
    if (currentStep < steps.length - 1) {
      currentStep += 1;
      isRunning = false;
    }
  }

  function toggleRun() {
    isRunning = !isRunning;    
  }

  function handlePrevRequest() {
    if (currentStep > 0) {
      currentStep -= 1;
      isRunning = false;
    }
  }

  function handleNextRequest() {
    if (currentStep < steps.length - 1) {
      currentStep += 1;
      isRunning = false;
    }
  }

  function handleSettingsUpdate(e: CustomEvent) {
    steps = e.detail.steps;
    saveToLocalStorage();
    currentStep = 0;
    isRunning = false;
  }

  function handleUpdateRule(e: CustomEvent) {
    applyTwoPercentRule = e.detail.applyTwoPercentRule;
    saveToLocalStorage();
  }

  function handleUpdateRoll(e: CustomEvent) {
    rollNumber = e.detail.rollNumber;
    saveToLocalStorage();
  }
  
  function handleUpdateVolume(e: CustomEvent) {
    solutionVolume = e.detail.solutionVolume;
    saveToLocalStorage();
  }
  
  function handleKeepScreenOn(e: CustomEvent) {
    keepScreenOn = e.detail.keepScreenOn;  
    localStorage.setItem('film-timer-keepScreenOn', JSON.stringify(keepScreenOn));    
  }

  function closeSettings() {
    showSettings = false;      
  }

  function enableNoSleep(newKeepScreenOn: boolean) {
    if (newKeepScreenOn) {
        nosleep.enable();
    } else {
        nosleep.disable();
    }
  }
</script>

<main class="relative">
  {#if showSettings}
    <div
      use:clickOutside={() => closeSettings()}
      class="relative z-50 max-w-md mx-auto space-y-4 rounded-xl"
    >
      <div class="flex justify-end">
        <GlassButton
          on:click={() => (showSettings = false)}
          class="w-10 h-10 p-0 flex items-center justify-center"
        >
          <X class="w-5 h-5 text-white" />
        </GlassButton>
      </div>

      <SettingsPanel
        {steps}
        {applyTwoPercentRule}
        {rollNumber}
        {solutionVolume}        
        {keepScreenOn}
        on:update={handleSettingsUpdate}
        on:updateRule={handleUpdateRule}
        on:updateRoll={handleUpdateRoll}
        on:updateVolume={handleUpdateVolume}
        on:updateKeepScreenOn={handleKeepScreenOn}
      />
    </div>    
  {/if}
  
  <div class="flex justify-end mb-4" style="display: {showSettings ? 'none' : ''};">
    <GlassButton
      on:click={() => (showSettings = true)}
      class="w-10 h-10 p-0 flex items-center justify-center"
    >
      <Settings class="w-5 h-5 text-white" />
    </GlassButton>
  </div>

  <div class="backdrop-blur-md bg-white/10 border border-white/20 shadow-2xl rounded-3xl p-10" style="display: {showSettings ? 'none' : 'block'};">
    <StepTimer
      bind:this={timerRef}
      steps={adjustedSteps}
      {currentStep}
      size={timerSize}
      bind:isRunning
      on:prevrequest={handlePrevRequest}
      on:nextrequest={handleNextRequest}
    />
  </div>

  <div class="flex justify-center gap-4 mt-8" style="display: {showSettings ? 'none' : ''};">
    <GlassButton text="Prev" on:click={() => timerRef?.prevStep()} disabled={currentStep === 0 && !isRunning} />
    <GlassButton text={isRunning ? 'Pause' : "Start"} 
      on:click={() => {
      enableNoSleep(keepScreenOn)
      toggleRun()
      }
    }/>
    <GlassButton text="Next" on:click={next} disabled={currentStep === steps.length - 1} />
  </div>
</main>
