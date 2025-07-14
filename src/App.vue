<template>
  <div id="app">
    <va-navbar color="#2c3e50" class="mb-4">
      <template #left>
        <va-navbar-item>
          <h2 style="color: white; margin: 0;">🎨 Hunyuan 3D Printer</h2>
        </va-navbar-item>
      </template>
      <template #right>
        <va-navbar-item>
          <div v-if="authState === 'signedin' && user">
            <span style="color: white;">Welcome, {{ user.username }}!</span>
            <va-button @click="signOut" color="danger" size="small" class="ml-2">
              Sign Out
            </va-button>
          </div>
        </va-navbar-item>
      </template>
    </va-navbar>

    <!-- Authentication Component -->
    <div v-if="authState !== 'signedin'" class="auth-container">
      <Authentication @authStateChange="handleAuthStateChange" />
    </div>

    <!-- Main Application -->
    <div v-if="authState === 'signedin'" class="main-container">
      <div class="row">
        <div class="col-md-6">
          <BedrockChatbot 
            :userId="user.username"
            @animal-companion-selected="handleAnimalCompanionSelected"
          />
        </div>
        <div class="col-md-6">
          <PrintRequestForm 
            @orderSubmitted="handleOrderSubmitted"
            :isLoading="isSubmitting"
            :animalCompanion="animalCompanion"
          />
        </div>
      </div>
      
      <div v-if="currentOrder" class="mt-4">
        <OrderStatus 
          :order="currentOrder"
          @statusUpdate="handleStatusUpdate"
        />
      </div>

      <div v-if="orderHistory.length > 0" class="mt-4">
        <OrderHistory :orders="orderHistory" />
      </div>
    </div>
  </div>
</template>

<script>
import { Auth } from 'aws-amplify'
import Authentication from './components/Authentication.vue'
import PrintRequestForm from './components/PrintRequestForm.vue'
import OrderStatus from './components/OrderStatus.vue'
import OrderHistory from './components/OrderHistory.vue'
import BedrockChatbot from './components/BedrockChatbot.vue'

export default {
  name: 'App',
  components: {
    Authentication,
    PrintRequestForm,
    OrderStatus,
    OrderHistory,
    BedrockChatbot
  },
  data() {
    return {
      authState: 'loading',
      user: null,
      currentOrder: null,
      orderHistory: [],
      isSubmitting: false,
      animalCompanion: null
    }
  },
  async mounted() {
    await this.checkAuthState()
  },
  methods: {
    async checkAuthState() {
      try {
        const user = await Auth.currentAuthenticatedUser()
        this.user = user
        this.authState = 'signedin'
        await this.loadOrderHistory()
      } catch (error) {
        this.authState = 'signedout'
      }
    },
    handleAuthStateChange(authState, user) {
      this.authState = authState
      this.user = user
      if (authState === 'signedin') {
        this.loadOrderHistory()
      }
    },
    async signOut() {
      try {
        await Auth.signOut()
        this.authState = 'signedout'
        this.user = null
        this.currentOrder = null
        this.orderHistory = []
      } catch (error) {
        console.error('Error signing out:', error)
      }
    },
    handleOrderSubmitted(order) {
      this.currentOrder = order
      this.orderHistory.unshift(order)
    },
    handleStatusUpdate(updatedOrder) {
      this.currentOrder = updatedOrder
      // Update in history as well
      const index = this.orderHistory.findIndex(o => o.orderId === updatedOrder.orderId)
      if (index !== -1) {
        this.orderHistory[index] = updatedOrder
      }
    },
    async loadOrderHistory() {
      // This would load previous orders from your API
      // For now, we'll keep it simple
      this.orderHistory = []
    },
    handleAnimalCompanionSelected(animal) {
      this.animalCompanion = animal;
      console.log(`Animal companion selected: ${animal}`);
    }
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}

.main-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.row {
  display: flex;
  flex-wrap: wrap;
  margin: 0 -15px;
}

.col-md-6 {
  flex: 0 0 50%;
  max-width: 50%;
  padding: 0 15px;
  box-sizing: border-box;
}

@media (max-width: 768px) {
  .col-md-6 {
    flex: 0 0 100%;
    max-width: 100%;
  }
}

.mt-4 {
  margin-top: 1.5rem;
}
</style>