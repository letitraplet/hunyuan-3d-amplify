<template>
  <va-card>
    <va-card-title>
      <h3>📋 Order History</h3>
    </va-card-title>
    <va-card-content>
      <div v-if="orders.length === 0" class="no-orders">
        <va-icon name="history" size="large" color="secondary" />
        <p>No previous orders found.</p>
      </div>
      
      <div v-else class="orders-list">
        <div 
          v-for="order in orders" 
          :key="order.orderId"
          class="order-item"
        >
          <div class="order-summary">
            <div class="order-main">
              <h4>{{ truncatePrompt(order.prompt) }}</h4>
              <p class="order-id">Order ID: {{ order.orderId }}</p>
              <p class="order-date">{{ formatDate(order.timestamp) }}</p>
            </div>
            
            <div class="order-status">
              <va-chip :color="getStatusColor(order.status)">
                {{ getStatusText(order.status) }}
              </va-chip>
            </div>
          </div>
          
          <div class="order-actions">
            <va-button 
              v-if="order.status === 'COMPLETED'"
              @click="downloadModel(order.orderId)"
              size="small"
              color="primary"
              icon="download"
            >
              Download
            </va-button>
            
            <va-button 
              v-if="order.status === 'COMPLETED'"
              @click="viewPreview(order.orderId)"
              size="small"
              color="info"
              icon="visibility"
            >
              Preview
            </va-button>
            
            <va-button 
              @click="reorderItem(order)"
              size="small"
              color="secondary"
              icon="refresh"
            >
              Reorder
            </va-button>
          </div>
        </div>
      </div>
    </va-card-content>
  </va-card>
</template>

<script>
import { API } from 'aws-amplify'
import dayjs from 'dayjs'

export default {
  name: 'OrderHistory',
  props: {
    orders: {
      type: Array,
      required: true
    }
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
        'SANITIZING': 'Processing',
        'REVIEW': 'Under Review',
        'PROCESSING': 'Generating',
        'COMPLETED': 'Completed',
        'FAILED': 'Failed',
        'REJECTED': 'Rejected'
      }
      return texts[status] || status
    },
    truncatePrompt(prompt) {
      return prompt.length > 60 ? prompt.substring(0, 60) + '...' : prompt
    },
    formatDate(timestamp) {
      return dayjs(timestamp).format('MMM D, YYYY h:mm A')
    },
    async downloadModel(orderId) {
      try {
        const response = await API.get('hunyuan3d', `/print/${orderId}/download`)
        window.open(response.downloadUrl, '_blank')
      } catch (error) {
        console.error('Error downloading model:', error)
        this.$toast.error('Failed to download model')
      }
    },
    async viewPreview(orderId) {
      try {
        const response = await API.get('hunyuan3d', `/print/${orderId}/download`)
        window.open(response.previewUrl, '_blank')
      } catch (error) {
        console.error('Error opening preview:', error)
        this.$toast.error('Failed to open preview')
      }
    },
    reorderItem(order) {
      this.$emit('reorder', {
        prompt: order.prompt,
        options: order.options || {}
      })
      this.$toast.info('Order details copied to form above')
    }
  }
}
</script>

<style scoped>
.no-orders {
  text-align: center;
  padding: 40px 20px;
  color: #666;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.order-item {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 15px;
  transition: box-shadow 0.2s;
}

.order-item:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.order-summary {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.order-main h4 {
  margin: 0 0 8px 0;
  color: #333;
}

.order-id,
.order-date {
  margin: 4px 0;
  font-size: 0.9em;
  color: #666;
}

.order-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .order-summary {
    flex-direction: column;
    gap: 10px;
  }
  
  .order-actions {
    justify-content: flex-start;
  }
}
</style>