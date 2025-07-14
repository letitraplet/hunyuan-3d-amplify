<template>
  <div class="print-form-card">
    <div class="card-header">
      <h3>🎨 Create Your 3D Model</h3>
    </div>
    <div class="card-content">
      <form @submit.prevent="submitRequest">
        <div class="form-group">
          <label for="prompt">Describe your 3D model:</label>
          <textarea
            id="prompt"
            v-model="prompt"
            placeholder="e.g., A detailed turtle with geometric shell patterns, A modern coffee mug with handle, A miniature castle with towers..."
            rows="4"
            maxlength="500"
            required
            class="form-textarea"
          ></textarea>
          <div class="help-text">
            Be as descriptive as possible. The AI will use your description to generate a unique 3D model.
          </div>
          <div class="character-count">{{ prompt.length }}/500</div>
        </div>

        <div class="form-row">
          <div class="form-group half-width">
            <label for="resolution">Model Resolution:</label>
            <select id="resolution" v-model="resolution" class="form-select">
              <option value="low">Low (Fast)</option>
              <option value="standard">Standard</option>
              <option value="high">High (Detailed)</option>
            </select>
          </div>
          <div class="form-group half-width">
            <label class="checkbox-label">
              <input type="checkbox" v-model="includeTexture" class="form-checkbox">
              Include Texture
            </label>
          </div>
        </div>

        <div class="example-prompts">
          <h4>Example Prompts:</h4>
          <div class="examples">
            <button
              v-for="example in examplePrompts"
              :key="example"
              @click.prevent="prompt = example"
              type="button"
              class="example-chip"
            >
              {{ example }}
            </button>
          </div>
        </div>

        <div class="form-actions">
          <button
            type="submit"
            :disabled="isLoading || !prompt.trim()"
            class="submit-button"
          >
            <span v-if="isLoading">🔄 Generating...</span>
            <span v-else>🎨 Generate 3D Model</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { API, Auth } from 'aws-amplify'

export default {
  name: 'PrintRequestForm',
  props: {
    isLoading: {
      type: Boolean,
      default: false
    },
    animalCompanion: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      prompt: '',
      resolution: 'standard',
      includeTexture: true, // Default to true as requested
      examplePrompts: [
        'A detailed turtle with geometric shell patterns',
        'A modern coffee mug with ergonomic handle',
        'A miniature castle with multiple towers',
        'A decorative vase with spiral patterns',
        'A cute robot with articulated joints',
        'A fantasy dragon in flight pose',
        'A architectural building model',
        'A decorative lamp shade with cutouts'
      ]
    }
  },
  watch: {
    animalCompanion(newValue) {
      if (newValue) {
        this.generateAnimalCompanionPrompt(newValue);
      }
    }
  },
  methods: {
    generateAnimalCompanionPrompt(animal) {
      const prompts = {
        cat: 'A 4cm diameter coin with a detailed cat design embossed on one side, with whiskers and alert eyes',
        dog: 'A 4cm diameter coin with a loyal dog design embossed on one side, with floppy ears and friendly expression',
        turtle: 'A 4cm diameter coin with a detailed turtle design embossed on one side, with geometric shell patterns',
        fox: 'A 4cm diameter coin with a clever fox design embossed on one side, with pointed ears and bushy tail',
        owl: 'A 4cm diameter coin with a wise owl design embossed on one side, with large eyes and detailed feathers',
        bear: 'A 4cm diameter coin with a strong bear design embossed on one side, with raised paw and detailed fur',
        wolf: 'A 4cm diameter coin with a majestic wolf design embossed on one side, with howling pose and detailed fur',
        rabbit: 'A 4cm diameter coin with a quick rabbit design embossed on one side, with long ears and alert posture',
        dolphin: 'A 4cm diameter coin with a playful dolphin design embossed on one side, with curved body and detailed fins',
        elephant: 'A 4cm diameter coin with a wise elephant design embossed on one side, with trunk raised and detailed texture',
        tiger: 'A 4cm diameter coin with a powerful tiger design embossed on one side, with stripes and fierce expression',
        lion: 'A 4cm diameter coin with a regal lion design embossed on one side, with detailed mane and proud posture',
        eagle: 'A 4cm diameter coin with a soaring eagle design embossed on one side, with spread wings and detailed feathers'
      };
      
      this.prompt = prompts[animal.toLowerCase()] || `A 4cm diameter coin with a detailed ${animal} design embossed on one side`;
    },
    async submitRequest() {
      if (!this.prompt.trim()) {
        alert('Please describe what you want to create')
        return
      }

      try {
        const user = await Auth.currentAuthenticatedUser()
        
        const requestData = {
          prompt: this.prompt,
          userId: user.username,
          options: {
            resolution: this.resolution,
            includeTexture: this.includeTexture
          }
        }

        this.$emit('loading', true)
        
        console.log('Submitting request:', requestData)
        
        const response = await API.post('hunyuan3d', '/print', {
          body: requestData
        })

        console.log('Response:', response)

        this.$emit('orderSubmitted', {
          orderId: response.orderId,
          prompt: this.prompt,
          status: 'submitted',
          timestamp: new Date().toISOString(),
          options: requestData.options
        })

        alert('3D model generation started! Check the status below.')
        this.prompt = ''
        
      } catch (error) {
        console.error('Error submitting request:', error)
        alert(`Failed to submit request: ${error.message || 'Please try again.'}`)
      } finally {
        this.$emit('loading', false)
      }
    }
  }
}
</script>

<style scoped>
.print-form-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-bottom: 20px;
}

.card-header {
  padding: 20px 20px 0 20px;
  border-bottom: 1px solid #eee;
}

.card-header h3 {
  margin: 0 0 20px 0;
  color: #333;
}

.card-content {
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  color: #333;
}

.form-textarea {
  width: 100%;
  padding: 12px;
  border: 2px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  min-height: 100px;
}

.form-textarea:focus {
  outline: none;
  border-color: #007bff;
}

.form-select {
  width: 100%;
  padding: 10px;
  border: 2px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  background: white;
}

.form-select:focus {
  outline: none;
  border-color: #007bff;
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-weight: normal !important;
}

.form-checkbox {
  margin-right: 8px;
  transform: scale(1.2);
}

.form-row {
  display: flex;
  gap: 20px;
}

.half-width {
  flex: 1;
}

.help-text {
  font-size: 0.9em;
  color: #666;
  margin-top: 5px;
}

.character-count {
  font-size: 0.8em;
  color: #999;
  text-align: right;
  margin-top: 5px;
}

.example-prompts {
  margin: 20px 0;
}

.example-prompts h4 {
  margin-bottom: 10px;
  color: #333;
}

.examples {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.example-chip {
  background: #e3f2fd;
  border: 1px solid #2196f3;
  color: #1976d2;
  padding: 6px 12px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.9em;
  transition: all 0.2s;
}

.example-chip:hover {
  background: #2196f3;
  color: white;
  transform: scale(1.05);
}

.form-actions {
  margin-top: 30px;
  text-align: center;
}

.submit-button {
  background: #28a745;
  color: white;
  border: none;
  padding: 15px 30px;
  border-radius: 6px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
  min-width: 200px;
}

.submit-button:hover:not(:disabled) {
  background: #218838;
}

.submit-button:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
  }
  
  .examples {
    justify-content: center;
  }
}
</style>