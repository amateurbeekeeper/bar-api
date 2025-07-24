# 🐭 BAR Keela Bridge – Maintain Styling, Submit Seamlessly (at Zero Cost)

This small API project was built for **Beyond Animal Research (BAR)** to let you:

### ✅ Keep the beautiful, styled newsletter form on your site  
### ✅ Still submit the form into **Keela**, without showing Keela's default embed  
### ✅ Avoid **any ongoing cost** — no paid services, no server hosting fees  
### ✅ Use modern tech & AI to research, test, and ship faster  

---

## 🧩 Why this exists

BAR wanted to:
- Keep the **clean Webflow-styled form** users already love
- Still submit that data into **Keela**, their actual CRM platform
- **Hide** the original Keela embed to keep brand consistency
- **Avoid any paid integrations** (e.g. Zapier, Make, or paying for Keela API access)
- Use tools that are modern, maintainable, and fun for developers too

So this project does exactly that, using:
- **Vercel** – for free, fast API hosting  
- **NestJS** – a scalable Node framework (and portfolio-friendly)  
- **Browserless** – a headless browser (via GraphQL) that simulates a real user submitting the Keela form behind the scenes

---

## ⚙️ How it works

1. Your Webflow form collects `name`, `email`, etc
2. That form sends data to our custom **Vercel API endpoint**
3. The API runs a **BrowserQL script** (via Browserless)
4. Browserless:
   - Visits the Keela form
   - Fills it out with the submitted values
   - Clicks the radio button and submit
5. The user never sees Keela — just your clean design ✅

---

## 🧾 Tech Stack

| Layer              | Tool                                                                 |
|-------------------|----------------------------------------------------------------------|
| API Hosting        | [Vercel](https://vercel.com/) (free tier)                            |
| Backend Framework  | [NestJS](https://nestjs.com/) with `@nestjs/platform-serverless`     |
| Browser Automation | [Browserless](https://www.browserless.io/) with [BrowserQL](https://www.browserless.io/browserql) |
| API Documentation  | [Swagger/OpenAPI](https://swagger.io/) with interactive UI            |
| Frontend           | [Webflow](https://webflow.com/) (existing site)                      |

---

## 📦 Zero-Cost Mission

- No Keela API required
- No need to pay for Make, Zapier, or hosted Puppeteer
- Free tier of Browserless (1k units/month is enough)
- Free tier of Vercel (plenty for this use case)

---

## 📚 API Documentation

### Swagger UI

The API includes comprehensive Swagger/OpenAPI documentation:

- **Local Development**: http://localhost:3000/api
- **Production**: https://your-vercel-domain.vercel.app/api

The Swagger UI provides:
- Interactive API documentation
- Request/response examples
- Try-it-out functionality
- Schema definitions
- Error response documentation

### API Endpoints

#### POST /signup

Submits user registration data to the Keela form via Browserless automation.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "isScientist": true
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Form submitted successfully",
  "data": {
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "isScientist": true
  }
}
```

## 🚀 Deployment

### Automatic Deployment (Current Setup)
This repository is connected to Vercel for automatic deployments:
- **Push to GitHub** → Automatic deployment to Vercel
- **Branch**: `main` triggers production deployment
- **No manual steps required** - just commit and push!

### Manual Deployment (If Needed)
If you ever need to deploy manually:

```bash
# Option 1: Use the deployment script
./deploy.sh

# Option 2: Manual commands
npm run build
vercel --prod
```

### Configuration Files
- **`vercel.json`** - Vercel deployment configuration
- **`deploy.sh`** - Deployment script for manual use
- **`.vercelignore`** - Files excluded from deployment

### Environment Variables
Set these in your Vercel dashboard:
- `BROWSERLESS_TOKEN` - Your Browserless API token
- `BROWSERLESS_URL` - Browserless GraphQL endpoint (optional)
- `KEELA_EMBED_URL` - Your Keela form URL (optional)

## 🚧 Next Steps

- [ ] Connect the Webflow form to our endpoint  
- [ ] Handle checkbox/radio conditionals dynamically  
- [ ] Improve fallback/error messaging  
- [ ] Explore self-hosted alternatives for full ownership (optional)

---

## 💬 Questions or Feedback?

This was built with ❤️ and a stubborn refusal to let a form ruin a great brand.  
Let’s keep iterating and make it bulletproof.
