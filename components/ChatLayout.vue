<template>
  <div class="layout-container">
    <!-- User avatar (top-right) -->
    <div class="user-avatar">
      HA
    </div>

    <!-- Main heading -->
    <h1 class="main-heading">
      What can I help with?
    </h1>

    <!-- Input container -->
    <div class="input-container">
      <!-- Left icon or placeholder -->
      <div class="left-icon">
        <!-- Example: a simple arrow or plus icon (replace with anything) -->
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="svg-icon"
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

      <!-- Actual text input -->
      <input
        class="text-input"
        type="text"
        placeholder="Message HarryAi"
      />

      <!-- Right icon (mic, voice, etc.) -->
      <div class="right-icon">
        🎤
      </div>
    </div>

    <!-- Nav buttons -->
    <div class="nav-buttons">
      <button
        v-for="(item, index) in navItems"
        :key="index"
        class="nav-button"
        :style="[buttonStyles[index]]"
        @mouseenter="onButtonHover(index, true)"
        @mouseleave="onButtonHover(index, false)"
      >
        {{ item }}
      </button>
    </div>

    <!-- Footer note -->
    <p class="footer-text">
      HarryAi doesn't make mistakes. Trust him with your life.
    </p>
  </div>
</template>

<script>
export default {
  name: 'ChatLayout',
  data() {
    return {
      navItems: ['Solve', 'Make a plan', 'Code', 'Summarize text', 'Analyze data', 'More'],
      buttonStyles: [
        { backgroundColor: '#FFB3B3', fontWeight: '700', transform: 'scale(1)' },
        { backgroundColor: '#B3E0FF', fontWeight: '700', transform: 'scale(1)' },
        { backgroundColor: '#B3FFB3', fontWeight: '700', transform: 'scale(1)' },
        { backgroundColor: '#FFE0B3', fontWeight: '700', transform: 'scale(1)' },
        { backgroundColor: '#E0B3FF', fontWeight: '700', transform: 'scale(1)' },
        { backgroundColor: '#B3FFE0', fontWeight: '700', transform: 'scale(1)' }
      ]
    };
  },
  methods: {
    onButtonHover(index, isHovering) {
      this.buttonStyles[index].transform = isHovering ? 'scale(1.05)' : 'scale(1)';
    }
  }
};
</script>

<style scoped>
/* Container to fill the full screen and center content */
.layout-container {
  position: relative;           /* So we can position the avatar absolutely */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;            /* Full viewport height */
  background-color: #202123;    /* A dark background color */
  color: #fff;                  /* White text */
  padding: 16px;                /* Some padding around edges on small screens */
  width: 100%;
  padding: 20px;
  box-sizing: border-box;
}

/* Top-right avatar or user icon */
.user-avatar {
  position: absolute;
  top: 16px;
  right: 16px;
  height: 40px;
  width: 40px;
  background-color: #ff7a00;    /* Example orange color */
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  cursor: default;
}

/* Main heading text */
.main-heading {
  font-size: 2rem;      /* Adjust as you wish */
  margin-bottom: 24px;
}

/* The input container with border, background, etc. */
.input-container { 
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 400px;
  border: 1px solid #3c3d3e;
  background-color: #2d2e2f;
  border-radius: 8px;
  padding: 8px 12px;
  margin-bottom: 32px;
}

/* Left icon styling */
.left-icon {
  margin-right: 8px;
  color: #ccc; /* Example icon color */
}

/* Right icon styling */
.right-icon {
  margin-left: 8px;
  color: #ccc;
}

/* SVG icons size */
.svg-icon {
  height: 20px;
  width: 20px;
  stroke: currentColor;
}

/* The text input itself */
.text-input {
  flex: 1;               /* Take up the remaining space */
  background: none;
  border: none;
  outline: none;
  color: #fff;
  font-size: 1rem;
}

/* Container for nav buttons */
.nav-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
  margin: 20px 0;
}

/* Individual nav button */
.nav-button {
  padding: 10px 24px;
  border: none;
  border-radius: 25px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  color: #333;
}

.nav-button:hover {
  transform: translateY(-2px);
  filter: brightness(110%);
}

/* Footer text */
.footer-text {
  font-size: 0.85rem;
  color: #aaa;
}
</style>
