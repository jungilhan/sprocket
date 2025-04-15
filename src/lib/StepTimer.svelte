<script lang="ts">
  import { onDestroy, createEventDispatcher } from 'svelte';

  export let steps: { name: string; duration: number; description: string }[] = [];
  export let size: number = 240; // Default size
  export let currentStep: number = 0;
  export let isRunning: boolean = false;

  const stroke = 10;
  const cx = size / 2;
  const cy = size / 2;
  const radius = (size - stroke * 2) / 2;
  const circumference = 2 * Math.PI * radius;

  let duration = steps[currentStep]?.duration || 60;
  let stepName = steps[currentStep]?.name || 'Timer';
  let remaining = duration;

  const dispatch = createEventDispatcher();
  let interval: number | null = null;

  $: {
    duration = steps[currentStep]?.duration || 60;
    stepName = steps[currentStep]?.name || 'Timer';
    remaining = duration;
  }

  $: {
    if (isRunning) {
      start();
    } else {
      stop();
    }
  }

  function start() {
    stop();
    if (remaining <= 0) return;
    interval = setInterval(() => {
      remaining -= 1;
      if (remaining <= 0) {
        stop();
        dispatch('stepdone', { step: currentStep });
        if (currentStep < steps.length - 1) {
          dispatch('nextrequest');
        } else {
          dispatch('done');
        }
      }
    }, 1000);
  }

  function stop() {
    if (interval) clearInterval(interval);
    interval = null;
  }

  export function prevStep() {
    if (remaining < duration - 1) {
      stop();
      remaining = duration;
      isRunning = false;
    } else {
      dispatch('prevrequest');
    }
  }

  onDestroy(() => stop());

  $: minutes = Math.floor(remaining / 60);
  $: seconds = remaining % 60;
  $: progressRatio = remaining / duration;
  $: offset = circumference * (1 - progressRatio);
</script>

<div class="relative mx-auto transition-transform duration-500 ease-in-out" style="width: {size}px; height: {size}px;">
  <!-- Timer Circle -->
  <svg width={size} height={size}>
    <circle cx={cx} cy={cy} r={radius} stroke="rgba(255,255,255,0.1)" stroke-width={stroke} fill="none" />
    <g transform={`translate(${size}, 0) scale(-1, 1)`}>
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        stroke="url(#gradient)"
        stroke-width={stroke}
        stroke-dasharray={circumference}
        stroke-dashoffset={offset}
        stroke-linecap="round"
        fill="none"
        transform={`rotate(-90 ${cx} ${cy})`}
        class="transition-all duration-500 ease-in-out drop-shadow-xl"
      />
    </g>

    <text
      x={cx}
      y={cy - size * 0.20}
      text-anchor="middle"
      fill="white"
      opacity="0.7"
      style="font-size: 14px; font-family: 'Sora', sans-serif;"
    >
      {stepName}
    </text>

    <text
      x={cx}
      y={cy}
      text-anchor="middle"
      dominant-baseline="middle"
      fill="white"
      style={`font-size: ${size * 0.2}px; font-family: 'Sora', sans-serif; font-weight: 300;`}
      filter="url(#glow)"
    >
      {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
    </text>

    <text
      x={cx}
      y={cy + size * 0.24}
      text-anchor="middle"
      fill="white"
      opacity="0.5"
      style="font-size: 12px; font-family: 'Sora', sans-serif;"
    >
      Step {currentStep + 1} of {steps.length}
    </text>

    <defs>
      <linearGradient id="gradient" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#f6adc6" />
        <stop offset="100%" stop-color="#ffc8a2" />
      </linearGradient>

      <filter id="glow" x="-50%" y="-50%" width="300%" height="300%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  </svg>

  <!-- Tooltip for Step Description -->
  {#if steps[currentStep]?.description}
    <div class="step-tooltip">
      <p>{steps[currentStep].description}</p>
    </div>
  {/if}
</div>

<style>
  .step-tooltip {
    position: absolute;
    top: -38px; /* Align tooltip to the top of the card */
    left: 100%;
    transform: translateX(60px); /* Position to the right of the card */
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 12px;
    color: white;
    font-size: 14px;
    text-align: left;
    min-width: 220px;
    max-width: 300px; /* Limit the maximum width */
    width: auto; /* Allow the width to auto adjust based on content */
    opacity: 0.8;
    transition: opacity 0.3s ease;
    pointer-events: none;
    white-space: normal; /* Ensure the text wraps */
    word-wrap: break-word; /* Wrap text if it's too long */
  }

  /* For mobile version */
  @media (max-width: 640px) {
    .step-tooltip {
      /* Position tooltip below buttons */
      top: 100%; /* Place it below the card */
      left: 50%;
      background-color: rgba(255, 255, 255, 0.0);
      text-align: center;
      transform: translateX(-50%); /* Center it horizontally */
      margin-top: 150px; /* Add some space above the tooltip */
    }
  }
</style>
