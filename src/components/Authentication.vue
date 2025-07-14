<template>
  <div class="auth-wrapper">
    <va-card class="auth-card">
      <va-card-title>
        <h3>{{ isSignUp ? 'Create Account' : 'Sign In' }}</h3>
      </va-card-title>
      <va-card-content>
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <va-input
              v-model="email"
              type="email"
              label="Email"
              :rules="[required, emailRule]"
              required
            />
          </div>
          
          <div class="form-group">
            <va-input
              v-model="password"
              type="password"
              label="Password"
              :rules="[required, passwordRule]"
              required
            />
          </div>

          <div v-if="isSignUp" class="form-group">
            <va-input
              v-model="confirmPassword"
              type="password"
              label="Confirm Password"
              :rules="[required, confirmPasswordRule]"
              required
            />
          </div>

          <div v-if="confirmationCode !== null" class="form-group">
            <va-input
              v-model="confirmationCode"
              label="Confirmation Code"
              placeholder="Enter the code sent to your email"
              required
            />
          </div>

          <div class="form-actions">
            <va-button
              type="submit"
              :loading="loading"
              color="primary"
              class="auth-button"
            >
              {{ getButtonText() }}
            </va-button>
          </div>

          <div class="form-toggle">
            <va-button
              @click="toggleMode"
              preset="plain"
              color="secondary"
            >
              {{ isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up' }}
            </va-button>
          </div>
        </form>
      </va-card-content>
    </va-card>
  </div>
</template>

<script>
import { Auth } from 'aws-amplify'

export default {
  name: 'Authentication',
  data() {
    return {
      isSignUp: false,
      email: '',
      password: '',
      confirmPassword: '',
      confirmationCode: null,
      loading: false,
      user: null
    }
  },
  methods: {
    required(value) {
      return !!value || 'This field is required'
    },
    emailRule(value) {
      const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return pattern.test(value) || 'Please enter a valid email address'
    },
    passwordRule(value) {
      return value.length >= 8 || 'Password must be at least 8 characters'
    },
    confirmPasswordRule(value) {
      return value === this.password || 'Passwords do not match'
    },
    toggleMode() {
      this.isSignUp = !this.isSignUp
      this.confirmationCode = null
      this.password = ''
      this.confirmPassword = ''
    },
    getButtonText() {
      if (this.confirmationCode !== null) return 'Confirm Account'
      return this.isSignUp ? 'Sign Up' : 'Sign In'
    },
    async handleSubmit() {
      this.loading = true
      try {
        if (this.confirmationCode !== null) {
          await this.confirmSignUp()
        } else if (this.isSignUp) {
          await this.signUp()
        } else {
          await this.signIn()
        }
      } catch (error) {
        this.$toast.error(error.message || 'Authentication failed')
      } finally {
        this.loading = false
      }
    },
    async signUp() {
      const { user } = await Auth.signUp({
        username: this.email,
        password: this.password,
        attributes: {
          email: this.email
        }
      })
      this.user = user
      this.confirmationCode = ''
      this.$toast.success('Account created! Please check your email for confirmation code.')
    },
    async confirmSignUp() {
      await Auth.confirmSignUp(this.email, this.confirmationCode)
      this.$toast.success('Account confirmed! You can now sign in.')
      this.confirmationCode = null
      this.isSignUp = false
    },
    async signIn() {
      const user = await Auth.signIn(this.email, this.password)
      this.$emit('authStateChange', 'signedin', user)
      this.$toast.success('Successfully signed in!')
    }
  }
}
</script>

<style scoped>
.auth-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.auth-card {
  width: 100%;
  max-width: 400px;
}

.form-group {
  margin-bottom: 20px;
}

.form-actions {
  margin-bottom: 20px;
}

.auth-button {
  width: 100%;
}

.form-toggle {
  text-align: center;
}
</style>