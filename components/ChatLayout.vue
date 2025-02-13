<template>
  <div class="layout-container">
    <!-- User avatar (top-right) -->
    <div class="user-avatar">
      HA
    </div>

    <!-- Messages area (visible when there are messages) -->
    <div class="messages-container" v-if="messages.length > 0">
      <div v-for="(message, idx) in messages" 
           :key="idx" 
           class="message"
           :class="{ 'user-message': message.isUser }">
        <div class="message-content">
          {{ message.text }}
        </div>
      </div>
    </div>

    <!-- Main heading (only visible when no messages) -->
    <h1 v-else class="main-heading" :style="{ fontFamily: currentFont }">
      What can I help with ?
    </h1>

    <!-- Nav buttons (only visible when no messages) -->
    <div class="nav-buttons" v-if="!isChat">
      <button
        v-for="(item, index) in navItems"
        :key="index"
        class="nav-button"
        :style="[buttonStyles[index]]"
        @mouseenter="onButtonHover(index, true)"
        @mouseleave="onButtonHover(index, false)">
        {{ item }}
      </button>
    </div>

    <!-- Input container (position changes based on isChat) -->
    <div class="input-container" :class="{ 'chat-mode': isChat }">
      <div class="left-icon">
        <svg xmlns="http://www.w3.org/2000/svg" class="svg-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10 19l-7-7 7-7M14 5l7 7-7 7"/>
        </svg>
      </div>

      <textarea
        v-model="currentMessage"
        class="text-input"
        type="text"
        placeholder="Message HarryAi"
        rows="1"
        @input="autoGrow"
        @keyup.enter.prevent="sendMessage"
        ref="textInput">
      </textarea>

      <button class="right-icon" @click="sendMessage">
        →
      </button>
    </div>

    <!-- Footer note (only visible when no messages) -->
    <p class="footer-text" v-if="!isChat">
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
      ],
      currentFont: '-apple-system',
      fonts: [
        'Courier, monospace',
        'Brush Script MT, cursive',
        'Webdings',
        'Comic Sans MS, cursive',
        'Impact, fantasy'
      ],
      messages: [],
      currentMessage: '',
      isChat: false
    };
  },
  methods: {
    onButtonHover(index, isHovering) {
      this.buttonStyles[index].transform = isHovering ? 'scale(1.05)' : 'scale(1)';
    },
    autoGrow(e) {
      const textarea = e.target;
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    },
    cycleFonts() {
      let index = 0;
      const interval = 100; // Time between changes
      
      const cycle = () => {
        this.currentFont = this.fonts[index];
        index++;
        
        if (index < this.fonts.length) {
          setTimeout(cycle, interval);
        } else {
          this.currentFont = '-apple-system'; // Reset to default
        }
      };
      
      cycle();
    },
    sendMessage() {
      if (!this.currentMessage.trim()) return;
      
      // Add user message to messages array
      this.messages.push({
        text: this.currentMessage,
        isUser: true
      });

      // Enable chat mode if it's the first message
      if (!this.isChat) {
        this.isChat = true;
      }

      // Clear input
      this.currentMessage = '';
      
      // Reset textarea height
      this.$nextTick(() => {
        if (this.$refs.textInput) {
          this.$refs.textInput.style.height = 'auto';
        }
      });

      // Simulate AI response (you can replace this with actual API call)
      setTimeout(() => {
        this.messages.push({
          text: "I'm here to help! What would you like to know?",
          isUser: false
        });
      }, 1000);
    }
  }
};
</script>

<style scoped>
/* Container to fill the full screen and center content */
.layout-container {
  font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif;
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
  font-weight: 500;
  transition: font-family 0.1s ease;
}

/* The input container with border, background, etc. */
.input-container { 
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 800px;
  border: 1px solid #3c3d3e;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 25px;
  padding: 10px 20px;
  margin-bottom: 32px;
}

/* Left icon styling */
.left-icon {
  margin-right: 12px;
  display: flex;
  align-items: center;
  color: #ccc; /* Example icon color */
}

/* Right icon styling */
.right-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #404244;
  border: none;
  color: #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s ease;
  margin-left: 8px;
}

.right-icon:hover {
  background-color: #4a4c4e;
}

/* SVG icons size */
.svg-icon {
  height: 20px;
  width: 20px;
  stroke: currentColor;
  opacity: 0.7;
}

/* The text input itself */
.text-input {
  flex: 1;               /* Take up the remaining space */
  background: none;
  border: none;
  outline: none;
  color: #fff;
  font-size: 1rem;
  resize: none;
  overflow: hidden;
  min-height: 24px;
  line-height: 24px;
  padding: 0;
  font-family: inherit;
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
  font-family: inherit;
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

/* Add these new styles to your existing CSS */
.messages-container {
  width: 100%;
  max-width: 800px;
  margin-bottom: 20px;
  overflow-y: auto;
  flex: 1;
  padding: 20px;
}

.message {
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
}

.message-content {
  padding: 12px 16px;
  border-radius: 18px;
  max-width: 70%;
  word-wrap: break-word;
}

.user-message {
  align-items: flex-end;
}

.user-message .message-content {
  background-color: #2b2c2f;
  color: white;
}

.message:not(.user-message) .message-content {
  background-color: #404244;
  color: white;
  align-self: flex-start;
}

.input-container {
  transition: all 0.3s ease;
}

.input-container.chat-mode {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
}

/* Modify your existing layout-container style */
.layout-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding: 16px;
  box-sizing: border-box;
  position: relative;
}

/* Add v-model to your text input */
.text-input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  color: #fff;
  font-size: 1rem;
  resize: none;
  overflow: hidden;
  min-height: 24px;
  line-height: 24px;
  padding: 0;
  font-family: inherit;
}
</style>
