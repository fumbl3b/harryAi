<template>
    <!-- Full-screen container -->
    <div class="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <!-- Top-right user icon (if you want it) -->
      <div class="absolute top-4 right-4 h-10 w-10 flex items-center justify-center bg-orange-500 rounded-full">
        <!-- Placeholder for user initials/avatar -->
        HA
      </div>
      
      <!-- Main heading -->
      <h1 class="text-3xl sm:text-4xl mb-6">
        What can I help with?
      </h1>
      
      <!-- Input field -->
      <div
        class="flex items-center w-full max-w-md border border-gray-700 rounded-lg bg-gray-800 px-4 py-2 mb-8"
      >
        <!-- Icon or placeholder on left (optional) -->
        <div class="text-gray-400 mr-2">
          <!-- An icon or a plus button, etc. Use an <svg> or <i> here if you like -->
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M11 19l-9-7 9-7M13 5l9 7-9 7"
            />
          </svg>
        </div>
        <!-- The actual text input -->
        <input
          class="bg-transparent w-full focus:outline-none text-white placeholder-gray-400"
          type="text"
          placeholder="Message ChatGPT"
        />
        <!-- Microphone or voice icon on the right (optional) -->
        <div class="text-gray-400 ml-2">
          <!-- Another icon placeholder -->
          🎤
        </div>
      </div>
  
      <!-- Menu buttons (Solve, Make a plan, Code, etc.) -->
      <div class="flex flex-wrap gap-2 mb-8">
        <button
          v-for="(item, index) in navItems"
          :key="index"
          class="px-4 py-2 rounded-md bg-gray-700 hover:bg-gray-600 transition-colors"
        >
          {{ item }}
        </button>
      </div>
      
      <!-- Footer note -->
      <p class="text-sm text-gray-500">
        ChatGPT can make mistakes. Check important info.
      </p>
    </div>
  </template>
  
  <script>
  export default {
    name: 'ChatGPTLayout',
    data() {
      return {
        navItems: [
          'Solve',
          'Make a plan',
          'Code',
          'Summarize text',
          'Analyze data',
          'More'
        ],
      };
    },
  };
  </script>
  
  <style scoped>
  /* You can add or override any styles here if not using Tailwind */
  </style>
  