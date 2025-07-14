# Hunyuan 3D Printer Frontend

A Vue.js frontend application for the Hunyuan 3D Printer service.

## Features

- 🎨 **AI-Powered 3D Generation**: Create 3D models from text descriptions
- 🔐 **Authentication**: Secure user authentication with AWS Cognito
- 📊 **Real-time Status**: Live updates on model generation progress
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 📋 **Order History**: Track all your previous 3D model requests
- ⬇️ **Download & Preview**: Download STL files and preview 3D models

## Setup

### Prerequisites

- Node.js 14+ and npm
- AWS account with deployed Hunyuan 3D backend

### Installation

1. Install dependencies:
```bash
npm install
```

2. Update configuration in `src/main.js`:
   - Replace `userPoolId` with your Cognito User Pool ID
   - Replace `userPoolWebClientId` with your Cognito Client ID
   - Verify the API endpoint matches your deployed API Gateway

3. Start development server:
```bash
npm run serve
```

4. Build for production:
```bash
npm run build
```

## Configuration

### AWS Cognito Setup

You need to get the following values from your deployed AWS infrastructure:

1. **User Pool ID**: Found in AWS Cognito console
2. **User Pool Web Client ID**: Found in your User Pool's App clients section

Update these in `src/main.js`:

```javascript
Amplify.configure({
  Auth: {
    region: 'eu-west-1',
    userPoolId: 'eu-west-1_XXXXXXXXX', // Your User Pool ID
    userPoolWebClientId: 'XXXXXXXXXXXXXXXXXXXXXXXXXX', // Your Client ID
    // ... other config
  }
})
```

### API Endpoint

The API endpoint is already configured to match your deployed API Gateway:
```
https://6b0k3ulwmk.execute-api.eu-west-1.amazonaws.com/prod
```

## Usage

1. **Sign Up/Sign In**: Create an account or sign in with existing credentials
2. **Create Model**: Enter a descriptive text prompt for your 3D model
3. **Monitor Progress**: Watch real-time status updates as your model is generated
4. **Download**: Once complete, download the STL file or view the 3D preview
5. **History**: View and manage all your previous orders

## Example Prompts

- "A detailed turtle with geometric shell patterns"
- "A modern coffee mug with ergonomic handle"
- "A miniature castle with multiple towers"
- "A decorative vase with spiral patterns"
- "A cute robot with articulated joints"

## Deployment

### Deploy to S3 (Static Website)

1. Build the application:
```bash
npm run build
```

2. Upload to S3 bucket:
```bash
aws s3 sync ./dist/ s3://your-frontend-bucket-name/
```

3. Configure S3 bucket for static website hosting

### Deploy with AWS Amplify

1. Connect your repository to AWS Amplify
2. Configure build settings (amplify.yml will be auto-generated)
3. Deploy automatically on git push

## Architecture

The frontend communicates with:
- **AWS Cognito**: User authentication
- **API Gateway**: REST API for 3D model requests
- **IoT Core**: Real-time status updates (future enhancement)
- **S3**: Download generated STL files and previews

## Troubleshooting

### Common Issues

1. **Authentication Errors**: Verify Cognito configuration in `main.js`
2. **API Errors**: Check that the API endpoint URL is correct
3. **CORS Issues**: Ensure API Gateway has proper CORS configuration
4. **Build Errors**: Run `npm install` to ensure all dependencies are installed

### Development

- Use browser developer tools to debug API calls
- Check the Network tab for failed requests
- Console logs will show authentication and API errors

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is part of the Hunyuan 3D Printer system and follows the same licensing terms.