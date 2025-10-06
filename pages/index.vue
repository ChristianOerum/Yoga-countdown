<template>
    <div class="min-h-screen flex flex-col items-center justify-center bg-[#F4F5F5] text-[#2F3241]">
      <!-- Header -->
      <h1 v-if="!finished" class="text-[68px] font-bold tracking-tight mb-8">Næste Yoga starter om...</h1>

      <!-- Status -->
      <h1 v-else class="text-[68px] font-bold tracking-tight mb-8 text-emerald-600 slow-pulse">Yoga er igang</h1>
  
      <!-- Countdown Display -->
      <div class="flex flex-col items-center gap-4 relative">

        <div v-if="finished" class="bg-[#F4F5F5] w-full h-full opacity-50 absolute z-30"></div>

        <div class="flex items-end gap-5">
          <template v-for="group in groups" :key="group.label">
            <div class="flex items-end gap-2">
              <!-- Tens wheel -->
              <div class="relative overflow-hidden rounded-2xl bg-white shadow ring-1 ring-gray-200 h-[92px] w-[84px]" style="box-shadow: 0px 0px 6px rgba(0, 0, 0, .06);">
                <div
                  class="will-change-transform transform-gpu mt-1"
                  :style="wheelStyle(group.start)"
                >
                  <div
                    v-for="n in 10"
                    :key="`tens-${group.label}-${n-1}`"
                    class="h-[92px] flex items-center justify-center text-[48px] font-bold leading-none"
                  >
                    {{ n - 1 }}
                  </div>
                </div>
              </div>
  
              <!-- Ones wheel -->
              <div class="relative overflow-hidden rounded-2xl bg-white shadow ring-1 ring-gray-200 h-[92px] w-[84px]" style="box-shadow: 0px 0px 6px rgba(0, 0, 0, .06);">
                <div
                  class="will-change-transform transform-gpu mt-1"
                  :style="wheelStyle(group.start + 1)"
                >
                  <div
                    v-for="m in 10"
                    :key="`ones-${group.label}-${m-1}`"
                    class="h-[92px] flex items-center justify-center text-[48px] font-bold leading-none"
                  >
                    {{ m - 1 }}
                  </div>
                </div>
              </div>
  
              <span class="pb-1.5 text-[20px] font-semibold text-gray-500 select-none">
                {{ group.label }}
              </span>
            </div>
          </template>
        </div>        
      </div>
      
      <div class="absolute bottom-8 flex flex-col items-center text-[16px]">
      <!-- Controls -->
        <form
            class="mt-10 w-full max-w-lg flex flex-col sm:flex-row items-stretch gap-2"
            @submit.prevent="startCountdown"
        >
            <input
            v-model.number="inputSeconds"
            type="number"
            min="0"
            placeholder="Indtast sekundter"
            class="flex-1 rounded-lg bg-white p-3 pr-4 pl-4 text-[16px] font-semibold focus:outline-none pb-[8px]"
            style="box-shadow: 0px 0px 6px rgba(0, 0, 0, .06);"
            />
            <button
            type="submit"
            class="rounded-lg p-3 pr-4 pl-4 text-[18px] font-semibold bg-[#0079ff] text-white active:scale-[0.99] transition pb-[6px]"
            >
            Start
            </button>
            <button
            type="button"
            @click="reset"
            class="rounded-lg p-3 pr-4 pl-4 text-[18px] font-semibold bg-[#E4E5E7] text-[#A8ABB0] active:scale-[0.99] transition pb-[6px]"
            >
            Nulstil
            </button>
        </form>
    </div>

    </div>
  </template>
  
  <script setup>
  import { ref, reactive, computed, watch, onBeforeUnmount } from 'vue'
  
  /* -------------------------------------------------
     Fixed pixel size for perfect alignment everywhere
  -------------------------------------------------- */
  const ITEM_HEIGHT_PX = 92 // matches h-[72px] on container & rows
  
  /* ---------------------------
     State & Countdown Logic
  --------------------------- */
  const TIMER_INTERVAL_MS = 1000
  
  const inputSeconds = ref(null)
  const remaining = ref(0)
  const finished = ref(false)
  let timerId = null
  
  // Six wheels: indices 0..5 for Ht, Ho, Mt, Mo, St, So
  // positions[i] := current digit value 0..9
  const positions = reactive([0, 0, 0, 0, 0, 0])
  // Whether we animate the change on this tick (disabled for certain wraps)
  const animate = reactive([true, true, true, true, true, true])
  // Per-wheel durations so 0→9 can take longer (scroll all the way back up)
  const durations = reactive([500, 500, 500, 500, 500, 500])
  const BASE_STEP_MS = 500 // ~80ms per step → 9 steps ≈ 720ms (tweak to taste)
  
  let prevDigits = [0, 0, 0, 0, 0, 0]
  
  // Three groups: hours, minutes, seconds
  const groups = [
    { label: 'T', start: 0 },
    { label: 'M', start: 2 },
    { label: 'S', start: 4 },
  ]
  
  // Current digits derived from remaining seconds
  const digits = computed(() => {
    const total = Math.max(remaining.value, 0)
    const hours = Math.min(Math.floor(total / 3600), 99)
    const minutes = Math.floor((total % 3600) / 60)
    const seconds = total % 60
    return [
      Math.floor(hours / 10),
      hours % 10,
      Math.floor(minutes / 10),
      minutes % 10,
      Math.floor(seconds / 10),
      seconds % 10,
    ]
  })
  
  function syncPositionsToDigits() {
    digits.value.forEach((d, i) => {
      positions[i] = d
      animate[i] = false // snap on initial sync
      durations[i] = 0
    })
    prevDigits = [...digits.value]
  }
  
  function startCountdown() {
    if (inputSeconds.value == null || inputSeconds.value < 0) return
    remaining.value = Math.floor(Number(inputSeconds.value) || 0)
    finished.value = false
    syncPositionsToDigits()
    startTimer()
  }
  
  function startTimer() {
    stopTimer()
    timerId = setInterval(() => {
      if (remaining.value <= 0) {
        stopTimer()
        finished.value = true
        return
      }
      remaining.value -= 1
    }, TIMER_INTERVAL_MS)
  }
  
  function stopTimer() {
    if (timerId) {
      clearInterval(timerId)
      timerId = null
    }
  }
  
  function reset() {
    stopTimer()
    finished.value = false
    remaining.value = 0
    inputSeconds.value = null
    for (let i = 0; i < 6; i++) {
      positions[i] = 0
      animate[i] = false
      durations[i] = 0
    }
    prevDigits = [0, 0, 0, 0, 0, 0]
  }
  
  /**
   * On every digit change:
   *  - If change magnitude is 1 (e.g., 7 → 6 or 3 → 4), animate a single step.
   *  - If 9 → 0 (counting up wrap), snap (no long scroll).
   *  - If 0 → 9 (countdown borrow), animate the long scroll (all the way back up).
   */
   watch(digits, (now) => {
  for (let i = 0; i < now.length; i++) {
    const prev = prevDigits[i]
    const next = now[i]

    const isWrapDown = prev === 9 && next === 0 // 9 → 0 (count up wrap)
    const isWrapUp   = prev === 0 && next === 9 // 0 → 9 (count down borrow)

    if (isWrapDown) {
      // Snap on 9→0
      animate[i] = false
      durations[i] = 0
    } else if (isWrapUp) {
      // Animate 0→9 using BASE_STEP_MS (not ×9 anymore)
      animate[i] = true
      durations[i] = BASE_STEP_MS
    } else {
      // Normal adjacent step
      const steps = Math.abs(next - prev)
      animate[i] = steps === 1
      durations[i] = BASE_STEP_MS
    }

    positions[i] = next
  }
  prevDigits = [...now]
})
  
  onBeforeUnmount(stopTimer)
  
  /* ---------------------------
     Wheel style helper
  --------------------------- */
  function wheelStyle(index) {
    // translate so the desired digit row sits in the viewport
    const translate = `translate3d(0, -${positions[index] * ITEM_HEIGHT_PX}px, 0)`
    // Only animate when animate[index] is true, using per-wheel durations
    const transition = animate[index]
      ? `transform ${durations[index]}ms ease-out`
      : 'none'
    return { transform: translate, transition }
  }
  </script>
  
  <style>
    @keyframes slow-pulse {
    0%, 100% {
        opacity: 1;
    }
    50% {
        opacity: 0.6;
    }
    }

    .slow-pulse {
    animation: slow-pulse 3s ease-in-out infinite; /* slower than Tailwind’s default (~1.5s) */
    }
   </style>