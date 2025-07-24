# 🚀 BAR Keela Bridge – NestJS API with Browserless Automation

A production-ready NestJS API that bridges your custom forms to Keela CRM using Browserless GraphQL automation. Built for **Beyond Animal Research (BAR)** to maintain brand consistency while seamlessly submitting data to Keela.

## ✨ Features

- 🚀 **Zero-Cost Solution** - No paid integrations, no Keela API fees
- 🎨 **Brand Consistency** - Keep your beautiful Webflow forms, hide Keela embeds
- 🤖 **Browserless Automation** - Headless browser automation via GraphQL
- 📚 **API Documentation** - Clean HTML docs in production, Swagger UI in development
- ☁️ **Vercel Deployment** - Automatic deployments from GitHub
- 🔒 **TypeScript** - Full type safety and modern development experience
- 🧪 **Mock Mode** - Graceful fallback when no Browserless token configured

## 🏗️ Architecture

```
Webflow Form → NestJS API → Browserless GraphQL → Keela Form
```

1. **Webflow Form** collects user data (name, email, preferences)
2. **NestJS API** receives the data and validates it
3. **Browserless GraphQL** automates form submission to Keela
4. **Keela CRM** receives the data without users seeing the embed

## 🛠️ Tech Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| **API Framework** | [NestJS](https://nestjs.com/) | Scalable Node.js framework with TypeScript |
| **Hosting** | [Vercel](https://vercel.com/) | Serverless deployment with automatic scaling |
| **Browser Automation** | [Browserless](https://www.browserless.io/) | Headless Chrome via GraphQL API |
| **API Documentation** | [Swagger/OpenAPI](https://swagger.io/) | Interactive documentation and testing |
| **Frontend** | [Webflow](https://webflow.com/) | Custom styled forms |
| **CRM** | [Keela](https://keela.co/) | Data destination |

## 📦 Project Structure

```
bar-api/
├── src/
│   ├── controllers/
│   │   └── signup.controller.ts    # POST /signup endpoint
│   ├── services/
│   │   └── browserless.service.ts  # Browserless GraphQL integration
│   ├── types/
│   │   └── signup.dto.ts          # TypeScript interfaces & Swagger docs
│   ├── app.module.ts              # Main application module
│   └── main.ts                    # Vercel serverless + local dev entry
├── package.json                   # Dependencies and scripts
├── vercel.json                    # Vercel deployment configuration
├── .vercelignore                  # Deployment optimization
├── test-api.http                  # API testing file
└── README.md                      # This documentation
```

## 🚀 Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/amateurbeekeeper/bar-api.git
cd bar-api
npm install
```

### 2. Local Development
```bash
npm run start:dev
# API available at http://localhost:3000
# Swagger UI at http://localhost:3000/docs
```

### 3. Test the API
```bash
curl -X POST http://localhost:3000/signup \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "isScientist": true
  }'
```

## 📚 API Documentation

### Development (Local)
- **Swagger UI**: http://localhost:3000/docs
- **Interactive testing** with full Swagger interface

### Production
- **HTML Documentation**: https://bar-api.vercel.app/docs
- **OpenAPI JSON**: https://bar-api.vercel.app/docs-json
- **Clean, fast loading** - no asset issues

### Endpoints

#### POST /signup
Submits user registration data to Keela via Browserless automation.

**Request:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "isScientist": true
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Form submitted successfully",
  "data": {
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "isScientist": true
  }
}
```

**Mock Response (when no token configured):**
```json
{
  "success": true,
  "message": "Mock form submission successful (no Browserless token configured)",
  "data": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "isScientist": true,
    "submittedAt": "2025-07-24T00:00:00.000Z",
    "mock": true
  }
}
```

**Error Response (400/500):**
```json
{
  "success": false,
  "message": "Error description",
  "error": "Error type"
}
```

## 🔧 Browserless Integration

The service uses Browserless GraphQL to:

1. **Create Session** → Initialize headless browser
2. **Navigate** → Go to Keela form URL
3. **Fill Form** → Type into firstName, lastName, email fields
4. **Select Radio** → Click appropriate scientist/non-scientist option
5. **Submit** → Click submit button
6. **Wait** → Wait for navigation and success indicators
7. **Cleanup** → Close browser session

### GraphQL Mutations Used
- `createSession` - Browser session management
- `goto` - Navigate to form URL
- `type` - Fill form fields
- `click` - Submit form and select options
- `waitForNavigation` - Wait for form submission
- `html` - Get final page content for success detection

## 🚀 Deployment

### Automatic Deployment
This repository is connected to Vercel for automatic deployments:
- **Push to GitHub** → Automatic deployment to Vercel
- **Branch**: `main` triggers production deployment
- **Zero manual steps** - just commit and push!

### Environment Variables
Set these in your Vercel dashboard:
- `BROWSERLESS_TOKEN` - Your Browserless API token (required for real automation)
- `BROWSERLESS_URL` - Browserless GraphQL endpoint (optional, defaults to chrome.browserless.io)
- `KEELA_EMBED_URL` - Your Keela form URL (optional, defaults to BAR's form)

### Production URLs
- **API**: https://bar-api.vercel.app/signup
- **Documentation**: https://bar-api.vercel.app/docs
- **OpenAPI Spec**: https://bar-api.vercel.app/docs-json

## 💰 Cost Analysis

| Service | Cost | Usage |
|---------|------|-------|
| **Vercel** | Free | 100GB bandwidth/month |
| **Browserless** | Free | 1,000 units/month |
| **GitHub** | Free | Public repository |
| **Total** | **$0/month** | Perfect for small to medium usage |

## 🔒 Security & Best Practices

- **Input Validation** - All fields validated before processing
- **Error Handling** - Comprehensive error responses
- **Environment Variables** - Sensitive data kept secure
- **CORS Configuration** - Cross-origin request handling
- **TypeScript** - Type safety throughout the application
- **Mock Mode** - Graceful fallback for testing without tokens

## 🧪 Testing

### Local Testing
```bash
# Test successful signup (mock mode)
curl -X POST http://localhost:3000/signup \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Jane","lastName":"Smith","email":"jane@example.com","isScientist":false}'

# Test validation error
curl -X POST http://localhost:3000/signup \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Invalid","email":"invalid-email"}'
```

### Production Testing
```bash
# Test production API
curl -X POST https://bar-api.vercel.app/signup \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","lastName":"User","email":"test@example.com","isScientist":true}'
```

## 🚧 Development

### Available Scripts
```bash
npm run start:dev    # Development server with hot reload
npm run build        # Build for production
npm run lint         # Run ESLint
npm run test         # Run tests (when added)
```

### Adding New Features
1. Create new controller/service files in `src/`
2. Add Swagger decorators for documentation
3. Update `app.module.ts` with new components
4. Test locally and deploy

## 🎯 Current Status

### ✅ **Working Features:**
- **API Endpoints** - POST /signup fully functional
- **Documentation** - Clean HTML docs in production, Swagger UI in dev
- **Mock Mode** - Graceful fallback when no Browserless token
- **Vercel Deployment** - Automatic deployments working
- **Error Handling** - Comprehensive error responses
- **TypeScript** - Full type safety

### 🔧 **Ready for Production:**
- **Add Browserless Token** - Set `BROWSERLESS_TOKEN` in Vercel dashboard
- **Real Automation** - Will use actual Browserless GraphQL API
- **Form Submission** - Will submit to real Keela forms

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

---

## 💬 Support

Built with ❤️ for Beyond Animal Research. Questions? Open an issue or reach out to the development team.

**Mission**: Keep beautiful forms, submit to Keela, pay nothing. 🎯
