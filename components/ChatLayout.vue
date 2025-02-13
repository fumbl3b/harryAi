<template>
  <div class="layout-container">
    <a href="https://fumblebee.site" target="_blank" rel="noopener noreferrer">
      <div class="user-avatar">
        Hi
      </div>
    </a>

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

    <h1 v-if="!isChat" class="main-heading" :style="{ fontFamily: currentFont }">
      What can I help with ?
    </h1>

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
        @keydown.enter.prevent="handleKeyDown"
        @keyup.enter.prevent="sendMessage"
        ref="textInput">
      </textarea>

      <button class="right-icon" @click="sendMessage">
        →
      </button>
    </div>

    <div class="nav-buttons" v-if="!isChat">
      <button
        v-for="(item, index) in navItems"
        :key="index"
        class="nav-button"
        :style="[buttonStyles[index]]"
        @mouseenter="onButtonHover(index, true)"
        @mouseleave="onButtonHover(index, false)"
        @click="simulateTyping(index)">
        {{ item }}
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
      currentFontIndex: 0,
      fonts: [
        '-apple-system',
        'Courier, monospace',
        'Brush Script MT, cursive',
        'Comic Sans MS, cursive',
        'Impact, fantasy',
        'Arial Black',
        'Verdana',
        'Times New Roman'
      ],
      messages: [],
      currentMessage: '',
      isChat: false,
      isGlitching: false,
      isTyping: false,
      typeText: "Can you explain in great detail, who would win in a fight between superman and goku?",
      navTexts: {
        0: "Can you solve a difficult math problem for me?",
        1: "Can you make a list of items I will need in case of nuclear apocalypse?",
        2: "I need the code to solve a binary search on an array of `n` input numbers written in COBOL.",
        3: "Can you summarize what happens in Joyce's Ulysses using zoomer brainrot lingo?",
        4: "What's going on with the dang stock market?",
        5: "Can you explain in great detail, who would win in a fight between superman and goku?"
      }
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
    cycleFont() {
      this.currentFontIndex = (this.currentFontIndex + 1) % this.fonts.length;
      this.currentFont = this.fonts[this.currentFontIndex];
    },
    glitchFonts() {
      if (this.isGlitching) return;
      this.isGlitching = true;
      
      let cycles = 0;
      const maxCycles = 15;
      const interval = 50; // ms between changes

      const glitchInterval = setInterval(() => {
        this.currentFontIndex = (this.currentFontIndex + 1) % this.fonts.length;
        this.currentFont = this.fonts[this.currentFontIndex];
        cycles++;

        if (cycles >= maxCycles) {
          clearInterval(glitchInterval);
          this.isGlitching = false;
        }
      }, interval);
    },
    handleKeyDown(e) {
      if (e.shiftKey) {
        e.preventDefault = false;
        return;
      }
      e.preventDefault();
    },
    sendMessage() {
      if (!this.currentMessage.trim()) {
        this.glitchFonts();
        return;
      }

      const messageText = this.currentMessage;
      
      // Immediately hide nav and heading
      this.isChat = true;
      
      // Push user's message
      this.messages.push({
        text: messageText,
        isUser: true
      });

      this.currentMessage = '';

      this.$nextTick(() => {
        if (this.$refs.textInput) {
          this.$refs.textInput.style.height = 'auto';
        }
      });

      // Push assistant typing indicator message (ellipsis animation)
      this.messages.push({
        text: '...',
        isUser: false,
        isTyping: true
      });

      // After 1 second, update the assistant message
      setTimeout(() => {
        const lastIdx = this.messages.length - 1;
        // Update the last message with the final text and remove typing indicator
        this.$set(this.messages, lastIdx, {
          ...this.messages[lastIdx],
          text: "hold on, my backend isn't set up yet :(",
          isTyping: false
        });
      }, 1000);
    },
    simulateTyping(index) {
      if (this.isTyping) return;
      this.isTyping = true;
      this.currentMessage = '';
      
      const textToType = this.navTexts[index] || '';
      if (!textToType) return;
      
      let charIndex = 0;
      const typeInterval = setInterval(() => {
        if (charIndex < textToType.length) {
          this.currentMessage += textToType[charIndex];
          this.$nextTick(() => this.autoGrow({ target: this.$refs.textInput }));
          charIndex++;
        } else {
          clearInterval(typeInterval);
          this.isTyping = false;
          setTimeout(() => this.sendMessage(), 500);
        }
      }, 50);
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
  position: relative;
  min-height: 100vh;
}

/* Top-right avatar or user icon */
.user-avatar {
  position: fixed; /* Changed from absolute */
  top: 16px;
  right: 16px;
  height: 40px;
  width: 40px;
  background-color: #ff7a00;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  cursor: default;
  outline: 6px solid rgba(32, 33, 35);
}

/* Ensure the text color inside the user-avatar (including its link) is always white */
.user-avatar,
.user-avatar a {
  color: #fff !important;
  text-decoration: none;
}

/* Main heading text */
.main-heading {
  font-size: 2rem;      /* Adjust as you wish */
  margin-bottom: 24px;
  font-weight: 500;
  transition: font-family 0.05s ease;
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
  padding: 12px 20px;
  margin-bottom: 32px;
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 10;
  box-sizing: border-box;
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
  margin-left: 12px;
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
  top: unset;
  bottom: 20px;
  transform: translateX(-50%);
}

.layout-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding: 16px;
  box-sizing: border-box;
  position: relative;
}

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

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.fade-move {
  transition: transform 0.5s ease;
}

.input-container {
  display: flex;
  align-items: center;
  background-color: #2b2c2f;
  border-radius: 24px;
  padding: 12px 20px;
  width: 90%;
  max-width: 800px;
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 10;
  box-sizing: border-box;
}

.input-container.chat-mode {
  position: fixed;
  left: 50%;
  top: unset;
  bottom: 20px;
  transform: translateX(-50%);
}

/* Nav buttons with fade transition */
.nav-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
  margin-top: 200px;
  position: relative;
  z-index: 5;
  opacity: 1;
  transition: opacity 0.3s ease;
}

.nav-buttons.hidden {
  opacity: 0;
  pointer-events: none;
}

@media (max-width: 768px) {
  .input-container {
    width: calc(100% - 32px);
    padding: 12px 16px;
    margin: 0 auto; /* center the container */
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-sizing: border-box;
  }
  
  /* Remove extra margins and add symmetric inner padding */
  .text-input {
    flex: 1;
    min-height: 36px;
    align-items: center;
    padding: 4px 8px; /* 8px padding on both sides */
    margin: 0; /* remove margins to prevent excess spacing */
    width: auto;
  }

  .left-icon {
    flex-shrink: 0;
    width: 24px;
    margin-right: 8px; /* provide small space on the right of the icon */
  }

  .right-icon {
    flex-shrink: 0;
    width: 24px;
    margin-left: 8px; /* provide small space on the left of the icon */
  }

  .main-heading {
    margin-bottom: 12px; /* Reduced margin for mobile view */
  }

  .input-container:not(.chat-mode) {
    top: auto;
    bottom: 80px; /* Position it above the nav buttons */
    transform: translateX(-50%);
  }
  
  .nav-buttons {
    position: fixed;
    left: 50%;
    bottom: 20px;
    transform: translateX(-50%);
    margin: 0;
    width: calc(100% - 32px);
    z-index: 5;
  }

  .input-container.chat-mode {
    top: unset;
    bottom: 20px;
    transform: translateX(-50%);
  }
  
  .input-container:not(.chat-mode) {
    top: 50%;
    bottom: auto;
    transform: translate(-50%, -50%);
  }

  .input-container:not(.chat-mode) {
    position: static;
    transform: none;
    width: calc(100% - 32px);
    margin: 20px auto;
  }
  
  .main-heading {
    margin-bottom: 12px;
    text-align: center;
  }

  .input-container.chat-mode {
    position: fixed;
    left: 50%;
    bottom: 20px;
    transform: translateX(-50%);
    width: calc(100% - 32px);
    margin: 0 auto;
  }
}
</style>

<style>
html, body {
  background-color: #202123 !important;
  overscroll-behavior: contain;
}
</style>
