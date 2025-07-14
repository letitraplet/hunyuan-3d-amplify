<template>
  <div class="chatbot-container">
    <div class="chatbot-header">
      <h2>Animal Companion Finder</h2>
      <p>Chat with me to discover your animal companion!</p>
    </div>
    
    <div class="chatbot-messages" ref="messagesContainer">
      <div v-for="(msg, index) in messages" :key="index" :class="['message', msg.sender]">
        <div class="message-bubble" :class="{ error: msg.error }">
          {{ msg.text }}
        </div>
      </div>
      <div v-if="isLoading" class="message bot">
        <div class="message-bubble typing">
          <span>.</span><span>.</span><span>.</span>
        </div>
      </div>
      <div ref="messagesEnd"></div>
    </div>
    
    <div class="chatbot-input">
      <input
        type="text"
        v-model="input"
        @keyup.enter="sendMessage"
        placeholder="Type your message..."
        :disabled="isLoading"
      />
      <button @click="sendMessage" :disabled="isLoading">
        Send
      </button>
    </div>
  </div>
</template>

<script>
import { API } from 'aws-amplify';

export default {
  name: 'BedrockChatbot',
  props: {
    userId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      messages: [],
      input: '',
      sessionId: null,
      conversationHistory: [],
      isLoading: false,
      animalCompanion: null
    };
  },
  created() {
    // Add initial welcome message
    this.messages.push({
      text: "Hello! I'm your AWS GenAI assistant. I'll help you discover your animal companion. Tell me about yourself, your interests, or ask me questions!",
      sender: 'bot'
    });
  },
  updated() {
    this.scrollToBottom();
  },
  methods: {
    scrollToBottom() {
      this.$nextTick(() => {
        const container = this.$refs.messagesContainer;
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      });
    },
    async sendMessage() {
      if (!this.input.trim()) return;
      
      // Add user message to chat
      this.messages.push({ text: this.input, sender: 'user' });
      this.isLoading = true;
      
      try {
        // Send message to Bedrock chatbot
        const response = await API.post('bedrockChatbotApi', '/chat', {
          body: {
            userId: this.userId,
            message: this.input,
            sessionId: this.sessionId,
            conversationHistory: this.conversationHistory
          }
        });
        
        // Store session ID for conversation continuity
        if (response.sessionId) {
          this.sessionId = response.sessionId;
        }
        
        // Update conversation history
        if (response.conversationHistory) {
          this.conversationHistory = response.conversationHistory;
        }
        
        // Add bot response to chat
        this.messages.push({ text: response.message, sender: 'bot' });
        
        // If animal companion was detected, emit event
        if (response.animalCompanion && !this.animalCompanion) {
          this.animalCompanion = response.animalCompanion;
          this.$emit('animal-companion-selected', response.animalCompanion);
        }
        
      } catch (error) {
        console.error('Error sending message:', error);
        this.messages.push({ 
          text: "I'm sorry, I encountered an error. Please try again.", 
          sender: 'bot',
          error: true
        });
      }
      
      this.input = '';
      this.isLoading = false;
    }
  }
};
</script>

<style scoped>
.chatbot-container {
  display: flex;
  flex-direction: column;
  height: 500px;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  background-color: #f9f9f9;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.chatbot-header {
  padding: 15px;
  background-color: #232f3e; /* AWS dark blue */
  color: white;
  text-align: center;
}

.chatbot-header h2 {
  margin: 0;
  font-size: 1.2rem;
}

.chatbot-header p {
  margin: 5px 0 0;
  font-size: 0.9rem;
  opacity: 0.8;
}

.chatbot-messages {
  flex: 1;
  padding: 15px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.message {
  margin-bottom: 10px;
  display: flex;
}

.message.user {
  justify-content: flex-end;
}

.message-bubble {
  max-width: 70%;
  padding: 10px 15px;
  border-radius: 18px;
  word-wrap: break-word;
}

.user .message-bubble {
  background-color: #ff9900; /* AWS orange */
  color: white;
  border-top-right-radius: 4px;
}

.bot .message-bubble {
  background-color: #e4e4e4;
  color: #333;
  border-top-left-radius: 4px;
}

.message-bubble.error {
  background-color: #ffdddd;
  border: 1px solid #ffcccc;
}

.message-bubble.typing span {
  display: inline-block;
  animation: dotTyping 1.5s infinite;
  margin-right: 3px;
}

.message-bubble.typing span:nth-child(2) {
  animation-delay: 0.5s;
}

.message-bubble.typing span:nth-child(3) {
  animation-delay: 1s;
}

@keyframes dotTyping {
  0% { opacity: 0.2; }
  50% { opacity: 1; }
  100% { opacity: 0.2; }
}

.chatbot-input {
  display: flex;
  padding: 10px;
  background-color: white;
  border-top: 1px solid #ddd;
}

.chatbot-input input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-right: 10px;
}

.chatbot-input button {
  padding: 10px 20px;
  background-color: #ff9900; /* AWS orange */
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.chatbot-input button:hover {
  background-color: #e88b00;
}

.chatbot-input button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}
</style>
