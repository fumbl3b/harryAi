<template>
  <div class="layout-container">
    <a href="https://fumblebee.site" target="_blank" rel="noopener noreferrer">
      <div class="user-avatar">
        Hi
      </div>
    </a>

    <!-- Messages area (visible when there are messages) -->
    <div class="messages-container" v-if="messages.length > 0" ref="messagesContainer">
      <div class="chat-controls">
        <button class="clear-button" @click="clearChat">
          Clear Chat
        </button>
      </div>
      
      <div class="messages-list">
        <div v-for="(message, idx) in messages" 
             :key="idx" 
             class="message"
             :class="{ 'user-message': message.isUser }">
          <div class="message-content">
            <!-- User messages just show plain text -->
            <span v-if="message.isUser" class="message-text">{{ message.text.trim() }}</span>
            <!-- Assistant messages render markdown -->
            <div v-else-if="!message.isTyping" class="message-text markdown-content" v-html="renderMarkdown(message.text.trim())"></div>
            <!-- Loading animation for assistant typing -->
            <div v-else class="message-text loading-dots">
              <span class="dot"></span>
              <span class="dot"></span>
              <span class="dot"></span>
            </div>
          </div>
        </div>
        
        <!-- Extra padding at the bottom to prevent messages from being hidden by input -->
        <div class="bottom-padding"></div>
      </div>
      
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
    </div>

    <h1 v-if="!isChat" class="main-heading" :style="{ fontFamily: currentFont }">
      <span class="typing-text">{{ displayedHeading }}</span><span class="cursor" :class="{ blink: isHeadingDone }">|</span>
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
        @keydown.enter.prevent="handleEnterKey"
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
      currentMessage: '',
      isTyping: false,
      headingText: "What can I help with?",
      displayedHeading: "",
      isHeadingDone: false,
      userHasScrolled: false,
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
  
  created() {
    // When component is created, set up a watch on messages to handle updates
    this.$watch('messages', () => {
      this.scrollToBottom();
    }, { deep: true });
  },
  
  mounted() {
    // Start the heading animation
    this.animateHeading();
    
    // When component is mounted, scroll to the bottom of messages
    this.scrollToBottom();
    
    // Add scroll event listener to detect when user manually scrolls
    if (this.$refs.messagesContainer) {
      this.$refs.messagesContainer.addEventListener('scroll', this.handleScroll);
    }
  },
  
  updated() {
    // After each update, make sure messages are visible
    this.scrollToBottom();
    
    // Re-attach scroll listener if it was removed (Vue sometimes recreates refs)
    if (this.$refs.messagesContainer && !this.$refs.messagesContainer._hasScrollListener) {
      this.$refs.messagesContainer.addEventListener('scroll', this.handleScroll);
      this.$refs.messagesContainer._hasScrollListener = true;
    }
  },
  
  beforeDestroy() {
    // Clean up scroll event listener when component is destroyed
    if (this.$refs.messagesContainer) {
      this.$refs.messagesContainer.removeEventListener('scroll', this.handleScroll);
    }
  },
  
  computed: {
    messages() {
      return this.$store.getters['chat/getAllMessages'];
    },
    messageHistory() {
      return this.$store.getters['chat/getMessageHistory'];
    },
    error() {
      return this.$store.getters['chat/getError'];
    },
    isChat() {
      return this.messages.length > 0;
    }
  },
  methods: {
    animateHeading() {
      if (this.displayedHeading.length < this.headingText.length) {
        const charIndex = this.displayedHeading.length;
        this.displayedHeading += this.headingText.charAt(charIndex);
        
        // Random typing speed between 70-150ms for natural effect
        const typingSpeed = Math.floor(Math.random() * 80) + 70;
        
        setTimeout(() => {
          this.animateHeading();
        }, typingSpeed);
      } else {
        this.isHeadingDone = true;
        
        // After finishing, randomly glitch the font occasionally
        setInterval(() => {
          if (Math.random() < 0.1 && !this.isGlitching) { // 10% chance to glitch
            this.glitchFonts();
          }
        }, 5000);
      }
    },
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
      const interval = 50; // ms

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
    handleScroll() {
      const container = this.$refs.messagesContainer;
      if (!container) return;
      
      // Check if user has scrolled up
      // We consider them scrolled up if they're more than 100px from the bottom
      const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
      this.userHasScrolled = !isAtBottom;
    },
    
    scrollToBottom(smooth = true) {
      const container = this.$refs.messagesContainer;
      if (!container) return;
      
      // Only auto-scroll if user hasn't manually scrolled up
      // or if we're sending a new message (which resets userHasScrolled)
      if (!this.userHasScrolled) {
        // First immediate call to ensure we start scrolling right away
        if (smooth) {
          container.scrollTo({
            top: container.scrollHeight,
            behavior: 'smooth'
          });
        } else {
          container.scrollTop = container.scrollHeight;
        }
        
        // Then wait for DOM update and call again to ensure all content is visible
        this.$nextTick(() => {
          if (container) {
            if (smooth) {
              container.scrollTo({
                top: container.scrollHeight,
                behavior: 'smooth'
              });
            } else {
              container.scrollTop = container.scrollHeight;
            }
          }
        });
        
        // One more time with a slight delay to catch any rendering delays
        setTimeout(() => {
          if (container) {
            if (smooth) {
              container.scrollTo({
                top: container.scrollHeight,
                behavior: 'smooth'
              });
            } else {
              container.scrollTop = container.scrollHeight;
            }
          }
        }, 100);
      }
    },
    
    handleEnterKey(e) {
      // If shift+enter, allow multiline input
      if (e.shiftKey) {
        return; // Don't prevent default to allow multiline
      }
      
      // Just Enter key - send the message
      this.sendMessage();
    },
    async sendMessage() {
      if (!this.currentMessage.trim()) {
        // Empty message, don't send
        return;
      }

      const messageText = this.currentMessage;
      this.currentMessage = '';

      this.$nextTick(() => {
        if (this.$refs.textInput) {
          this.$refs.textInput.style.height = 'auto';
        }
      });
      
      // Reset userHasScrolled flag when sending a new message
      // This ensures we always scroll to the bottom when the user sends a message
      this.userHasScrolled = false;

      // Use the store action to send the message
      // This will use the full conversation history
      try {
        await this.$store.dispatch('chat/sendMessage', messageText);
        
        // Smoothly scroll to bottom after receiving response
        this.scrollToBottom(true);
      } catch (error) {
        console.error('Failed to send message:', error);
        
        // Scroll to bottom after showing error (with smooth animation)
        this.scrollToBottom(true);
      }
    },
    simulateTyping(index) {
      if (this.isTyping) return;
      this.isTyping = true;
      
      const textToType = this.navTexts[index] || '';
      if (!textToType) return;
      
      // Set the message directly in the input field
      this.currentMessage = textToType;
      this.$nextTick(() => this.autoGrow({ target: this.$refs.textInput }));
      
      // Small delay before sending
      setTimeout(() => {
        this.isTyping = false;
        
        // Use the store action through sendMessage which now properly uses history
        this.sendMessage();
      }, 100);
    },
    
    // Clears the chat history
    clearChat() {
      this.$store.dispatch('chat/clearChat');
    },
    
    // Simple Markdown renderer using regex
    renderMarkdown(text) {
      if (!text) return '';
      
      try {
        // Escape HTML to prevent XSS
        let html = this.escapeHtml(text);
        
        // Basic code blocks
        html = html.replace(/```([\s\S]+?)```/g, '<pre><code>$1</code></pre>');
        
        // Inline code
        html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
        
        // Bold
        html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        
        // Italic
        html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
        
        // Line breaks
        html = html.replace(/\n/g, '<br>');
        
        // Trigger scroll to bottom since content may have changed
        this.$nextTick(() => this.scrollToBottom());
        
        return html;
      } catch (error) {
        console.error('Error rendering markdown:', error);
        return this.escapeHtml(text); // Fall back to plain text
      }
    },
    
    // Helper function to escape HTML
    escapeHtml(text) {
      const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
      };
      
      return text.replace(/[&<>"']/g, function(m) { return map[m]; });
    }
  }
};
</script>

<style>
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
  margin-bottom: 100px; /* Increased to ensure space for input box */
  overflow-y: auto;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
  flex: 1;
  padding: 20px;
  max-height: calc(100vh - 150px);
  display: flex;
  flex-direction: column;
}

/* Hide scrollbar for Chrome, Safari and Opera */
.messages-container::-webkit-scrollbar {
  display: none;
}

.messages-list {
  overflow-y: auto;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* Hide scrollbar for Chrome, Safari and Opera */
.messages-list::-webkit-scrollbar {
  display: none;
}

.message {
  margin-bottom: 4px; /* Minimal space between messages */
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
  font-weight: normal;
  font-size: 14px; /* Consistent font size */
}

.message:not(.user-message) .message-content {
  background-color: #404244;
  color: white;
  align-self: flex-start;
  font-weight: 400; /* Make assistant responses easier to read */
  font-size: 14px; /* Same font size as user messages */
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

.typing-text {
  display: inline-block;
}

.cursor {
  display: inline-block;
  color: #fff;
  font-weight: normal;
  margin-left: 1px;
}

.cursor.blink {
  animation: blink-animation 1s steps(2, start) infinite;
}

@keyframes blink-animation {
  to {
    visibility: hidden;
  }
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
  z-index: 1000; /* Ensure it's above other content */
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

/* Chat controls */
.chat-controls {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 16px;
}

.clear-button {
  background-color: rgba(255, 255, 255, 0.1);
  color: #ccc;
  border: 1px solid #3c3d3e;
  border-radius: 15px;
  padding: 6px 12px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.2s ease;
}

.clear-button:hover {
  background-color: rgba(255, 255, 255, 0.2);
}


/* Message styling */
.message-content {
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.4;
  padding: 6px 10px; /* Minimal padding */
  margin: 1px 0; /* Minimal margin */
  max-width: 90%; /* Wider messages */
  border-radius: 16px;
  text-indent: 0; /* Ensure no indentation */
  padding-left: 10px; /* Consistent left padding */
}

.message-text {
  display: inline-block;
  white-space: pre-wrap;
  text-indent: 0;
  margin: 0;
  padding: 0;
  line-height: 1.4;
  font-size: 14px;
}

.bottom-padding {
  height: 80px; /* Provides space at the bottom so messages aren't hidden by input box */
  width: 100%;
}

/* Markdown content styling for our simplified renderer */
.markdown-content {
  font-size: 14px; /* Ensure consistent size */
}

.markdown-content h1, 
.markdown-content h2, 
.markdown-content h3 {
  margin: 10px 0 5px 0;
  font-weight: 600;
  line-height: 1.2;
}

.markdown-content h1 {
  font-size: 18px;
}

.markdown-content h2 {
  font-size: 16px;
}

.markdown-content h3 {
  font-size: 14px;
}

.markdown-content pre {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
  padding: 8px;
  overflow-x: auto;
  margin: 8px 0;
  max-width: 100%;
}

.markdown-content code {
  font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
  font-size: 13px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
  padding: 2px 4px;
}

.markdown-content pre code {
  padding: 0;
  background: transparent;
  display: block;
  overflow-x: auto;
}

.markdown-content ul {
  margin: 8px 0;
  padding-left: 20px;
}

.markdown-content li {
  margin: 4px 0;
}

.markdown-content strong {
  font-weight: 600;
}

.markdown-content em {
  font-style: italic;
}

.markdown-content a {
  color: #64B5F6;
  text-decoration: underline;
}

/* Loading animation */
.loading-dots {
  display: flex;
  align-items: center;
  height: 20px;
}

.dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #ccc;
  margin-right: 4px;
  animation: bounce 1.4s infinite ease-in-out both;
}

.dot:nth-child(1) {
  animation-delay: -0.32s;
}

.dot:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

/* Error message */
.error-message {
  color: #ff6b6b;
  padding: 10px 16px;
  margin: 8px 0;
  background-color: rgba(255, 107, 107, 0.1);
  border-radius: 10px;
  text-align: center;
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

  .nav-button:active {
    transform: translateY(-2px);
    filter: brightness(110%);
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
