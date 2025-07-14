<template>
  <va-card>
    <va-card-title>
      <h3>🔄 Order Status</h3>
    </va-card-title>
    <va-card-content>
      <div class="order-info">
        <div class="order-header">
          <h4>Order ID: {{ order.orderId }}</h4>
          <va-chip :color="getStatusColor(order.status)" class="status-chip">
            {{ getStatusText(order.status) }}
          </va-chip>
        </div>
        
        <div class="order-details">
          <p><strong>Prompt:</strong> {{ order.prompt }}</p>
          <p><strong>Submitted:</strong> {{ formatDate(order.timestamp) }}</p>
        </div>

        <div class="progress-section">
          <va-progress-bar 
            :model-value="getProgressValue(order.status)"
            :color="getStatusColor(order.status)"
            class="progress-bar"
          />
          
          <div class="progress-steps">
            <div 
              v-for="step in progressSteps" 
              :key="step.key"
              :class="['step', { active: isStepActive(step.key), completed: isStepCompleted(step.key) }]"
            >
              <va-icon :name="step.icon" :color="getStepColor(step.key)" />
              <span>{{ step.label }}</span>
            </div>
          </div>
        </div>

        <div v-if="order.status === 'COMPLETED'" class="completed-section">
          <va-alert color="success" icon="check_circle">
            Your 3D model is ready! You can download it below.
          </va-alert>
          
          <div class="download-actions">
            <va-button 
              @click="downloadModel"
              color="primary" 
              icon="download"
              class="download-btn"
            >
              Download STL File
            </va-button>
            
            <va-button 
              @click="viewPreview"
              color="info" 
              icon="visibility"
              class="preview-btn"
            >
              3D Preview
            </va-button>
          </div>
        </div>

        <div v-if="order.status === 'FAILED'" class="error-section">
          <va-alert color="danger" icon="error">
            Generation failed. Please try again with a different prompt.
          </va-alert>
        </div>

        <div class="refresh-section">
          <va-button 
            @click="refreshStatus"
            :loading="refreshing"
            preset="secondary"
            icon="refresh"
            size="small"
          >
            Refresh Status
          </va-button>
          <span class="last-updated">Last updated: {{ formatTime(lastUpdated) }}</span>
        </div>
      </div>
    </va-card-content>
  </va-card>
</template>

<script>
import { API } from 'aws-amplify'
import dayjs from 'dayjs'

export default {
  name: 'OrderStatus',
  props: {
    order: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      refreshing: false,
      lastUpdated: new Date(),
      progressSteps: [
        { key: 'submitted', label: 'Submitted', icon: 'send' },
        { key: 'sanitizing', label: 'Processing', icon: 'cleaning_services' },
        { key: 'reviewing', label: 'Reviewing', icon: 'fact_check' },
        { key: 'generating', label: 'Generating', icon: '3d_rotation' },
        { key: 'completed', label: 'Complete', icon: 'check_circle' }
      ],
      statusPolling: null
    }
  },
  mounted() {
    this.startStatusPolling()
  },
  beforeUnmount() {
    this.stopStatusPolling()
  },
  methods: {
    getStatusColor(status) {
      const colors = {
        'submitted': 'info',
        'SANITIZING': 'warning',
        'REVIEW': 'warning',
        'PROCESSING': 'primary',
        'COMPLETED': 'success',
        'FAILED': 'danger',
        'REJECTED': 'danger'
      }
      return colors[status] || 'info'
    },
    getStatusText(status) {
      const texts = {
        'submitted': 'Submitted',
        'SANITIZING': 'Processing Request',
        'REVIEW': 'Under Review',
        'PROCESSING': 'Generating Model',
        'COMPLETED': 'Completed',
        'FAILED': 'Failed',
        'REJECTED': 'Rejected'
      }
      return texts[status] || status
    },
    getProgressValue(status) {
      const values = {
        'submitted': 20,
        'SANITIZING': 40,
        'REVIEW': 60,
        'PROCESSING': 80,
        'COMPLETED': 100,
        'FAILED': 100,
        'REJECTED': 100
      }
      return values[status] || 0
    },
    isStepActive(stepKey) {
      const currentStep = this.getCurrentStep()
      return stepKey === currentStep
    },
    isStepCompleted(stepKey) {
      const stepOrder = ['submitted', 'sanitizing', 'reviewing', 'generating', 'completed']
      const currentIndex = stepOrder.indexOf(this.getCurrentStep())
      const stepIndex = stepOrder.indexOf(stepKey)
      return stepIndex < currentIndex
    },
    getCurrentStep() {
      const statusMap = {
        'submitted': 'submitted',
        'SANITIZING': 'sanitizing',
        'REVIEW': 'reviewing',
        'PROCESSING': 'generating',
        'COMPLETED': 'completed',
        'FAILED': 'completed',
        'REJECTED': 'completed'
      }
      return statusMap[this.order.status] || 'submitted'
    },
    getStepColor(stepKey) {
      if (this.isStepCompleted(stepKey)) return 'success'
      if (this.isStepActive(stepKey)) return 'primary'
      return 'secondary'
    },
    async refreshStatus() {
      this.refreshing = true
      try {
        const response = await API.get('hunyuan3d', `/print/${this.order.orderId}`)
        this.$emit('statusUpdate', { ...this.order, ...response })
        this.lastUpdated = new Date()
      } catch (error) {
        console.error('Error refreshing status:', error)
        this.$toast.error('Failed to refresh status')
      } finally {
        this.refreshing = false
      }
    },
    startStatusPolling() {
      if (this.order.status !== 'COMPLETED' && this.order.status !== 'FAILED') {
        this.statusPolling = setInterval(() => {
          this.refreshStatus()
        }, 10000) // Poll every 10 seconds
      }
    },
    stopStatusPolling() {
      if (this.statusPolling) {
        clearInterval(this.statusPolling)
        this.statusPolling = null
      }
    },
    async downloadModel() {
      try {
        const response = await API.get('hunyuan3d', `/print/${this.order.orderId}/download`)
        window.open(response.downloadUrl, '_blank')
      } catch (error) {
        console.error('Error downloading model:', error)
        this.$toast.error('Failed to download model')
      }
    },
    async viewPreview() {
      try {
        const response = await API.get('hunyuan3d', `/print/${this.order.orderId}/download`)
        window.open(response.previewUrl, '_blank')
      } catch (error) {
        console.error('Error opening preview:', error)
        this.$toast.error('Failed to open preview')
      }
    },
    formatDate(timestamp) {
      return dayjs(timestamp).format('MMM D, YYYY h:mm A')
    },
    formatTime(timestamp) {
      return dayjs(timestamp).format('h:mm:ss A')
    }
  },
  watch: {
    'order.status'(newStatus) {
      if (newStatus === 'COMPLETED' || newStatus === 'FAILED') {
        this.stopStatusPolling()
      } else {
        this.startStatusPolling()
      }
    }
  }
}
</script>

<style scoped>
.order-info {
  padding: 10px 0;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.status-chip {
  font-weight: bold;
}

.order-details {
  margin-bottom: 30px;
}

.order-details p {
  margin: 8px 0;
}

.progress-section {
  margin: 30px 0;
}

.progress-bar {
  margin-bottom: 20px;
}

.progress-steps {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  flex: 1;
  opacity: 0.5;
  transition: opacity 0.3s;
}

.step.active,
.step.completed {
  opacity: 1;
}

.step span {
  margin-top: 5px;
  font-size: 0.9em;
}

.completed-section,
.error-section {
  margin: 20px 0;
}

.download-actions {
  display: flex;
  gap: 15px;
  margin-top: 15px;
}

.refresh-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.last-updated {
  font-size: 0.9em;
  color: #666;
}
</style>