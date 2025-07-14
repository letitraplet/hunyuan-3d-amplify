import { createApp } from 'vue'
import App from './App.vue'
import { VuesticPlugin } from 'vuestic-ui' 
import 'vuestic-ui/dist/vuestic-ui.css' 
import Toaster from '@meforma/vue-toaster';

// Global event bus
import mitt from 'mitt';
const emitter = mitt();

// Amplify imports
import { Amplify } from 'aws-amplify'

// Configure Amplify with environment variables
Amplify.configure({
  Auth: {
    region: process.env.VUE_APP_REGION || 'eu-west-1',
    identityPoolRegion: process.env.VUE_APP_REGION || 'eu-west-1',
    userPoolId: process.env.VUE_APP_USER_POOL_ID,
    userPoolWebClientId: process.env.VUE_APP_USER_POOL_CLIENT_ID,
    mandatorySignIn: false,
    authenticationFlowType: 'USER_SRP_AUTH',
  },
  API: {
    endpoints: [
      {
        name: "hunyuan3d",
        endpoint: process.env.VUE_APP_API_URL,
        region: process.env.VUE_APP_REGION || 'eu-west-1'
      },
      {
        name: "bedrockChatbotApi",
        endpoint: process.env.VUE_APP_CHATBOT_API_URL || process.env.VUE_APP_API_URL,
        region: process.env.VUE_APP_REGION || 'eu-west-1'
      }
    ]
  }
})

const app = createApp(App)
app.use(VuesticPlugin)
app.use(Toaster)
app.config.globalProperties.emitter = emitter
app.mount('#app')