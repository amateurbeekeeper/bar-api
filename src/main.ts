import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";

let app: any;

async function bootstrap() {
  try {
    if (!app) {
      console.log("Creating NestJS application...");
      app = await NestFactory.create(AppModule);

      console.log("Enabling CORS...");
      // Enable CORS for Vercel deployment
      app.enableCors({
        origin: true,
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
        credentials: true,
      });

      console.log("Setting up API documentation...");
      // Swagger configuration
      const config = new DocumentBuilder()
        .setTitle("Bar API")
        .setDescription(
          "NestJS API with Browserless GraphQL integration for form automation",
        )
        .setVersion("1.0")
        .addTag("Signup", "User registration endpoints")
        .addBearerAuth()
        .build();

      const document = SwaggerModule.createDocument(app, config);

      // Serve OpenAPI JSON for external tools
      app.use("/docs-json", (req, res) => {
        res.json(document);
      });

      // Only serve Swagger UI in development
      if (process.env.NODE_ENV !== "production") {
        SwaggerModule.setup("docs", app, document, {
          swaggerOptions: {
            persistAuthorization: true,
          },
        });
      } else {
        // In production, serve a simple HTML page with links
        app.use("/docs", (req, res) => {
          res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Bar API Documentation</title>
                <style>
                    body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
                    h1 { color: #333; }
                    .endpoint { background: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 5px; }
                    .method { background: #007cba; color: white; padding: 5px 10px; border-radius: 3px; display: inline-block; }
                    .url { font-family: monospace; background: #e9ecef; padding: 5px; border-radius: 3px; }
                    .description { margin: 10px 0; }
                    .example { background: #f8f9fa; padding: 10px; border-left: 4px solid #007cba; margin: 10px 0; }
                </style>
            </head>
            <body>
                <h1>🚀 Bar API Documentation</h1>
                <p>This API bridges your forms to Keela CRM using Browserless automation.</p>
                
                <div class="endpoint">
                    <h2><span class="method">POST</span> <span class="url">/signup</span></h2>
                    <div class="description">Submit user registration data to Keela via Browserless automation.</div>
                    
                    <h3>Request Body:</h3>
                    <div class="example">
                        <pre>{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "isScientist": true
}</pre>
                    </div>
                    
                    <h3>Success Response (200):</h3>
                    <div class="example">
                        <pre>{
  "success": true,
  "message": "Form submitted successfully",
  "data": {
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "isScientist": true
  }
}</pre>
                    </div>
                    
                    <h3>Test the API:</h3>
                    <p>Use tools like <a href="https://www.postman.com/" target="_blank">Postman</a>, <a href="https://insomnia.rest/" target="_blank">Insomnia</a>, or curl:</p>
                    <div class="example">
                        <pre>curl -X POST https://bar-api.vercel.app/signup \\
  -H "Content-Type: application/json" \\
  -d '{"firstName":"John","lastName":"Doe","email":"john@example.com","isScientist":true}'</pre>
                    </div>
                </div>
                
                <h2>📋 OpenAPI Specification</h2>
                <p>Download the complete API specification: <a href="/docs-json" target="_blank">OpenAPI JSON</a></p>
                
                <h2>🔧 Development</h2>
                <p>For interactive documentation during development, run locally: <code>npm run start:dev</code></p>
                <p>Then visit: <a href="http://localhost:3000/docs" target="_blank">http://localhost:3000/docs</a></p>
            </body>
            </html>
          `);
        });
      }

      console.log("Initializing application...");
      await app.init();
      console.log("Application initialized successfully");
    }
    return app;
  } catch (error) {
    console.error("Bootstrap error:", error);
    console.error("Bootstrap error stack:", error.stack);
    throw error;
  }
}

// Vercel serverless function handler
export default async function handler(req: any, res: any) {
  try {
    const app = await bootstrap();
    const expressApp = app.getHttpAdapter().getInstance();

    // Handle Vercel's serverless function format
    if (req.body && typeof req.body === "string") {
      try {
        req.body = JSON.parse(req.body);
      } catch (e) {
        // Ignore parsing errors
      }
    }

    return expressApp(req, res);
  } catch (error) {
    console.error("Handler error:", error);
    console.error("Error stack:", error.stack);

    if (!res.headersSent) {
      res.status(500).json({
        error: "Internal server error",
        message: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }
}

// Local development server startup
if (process.env.NODE_ENV !== "production") {
  bootstrap().then(async (app) => {
    const port = process.env.PORT || 3000;
    await app.listen(port);
    console.log(`🚀 Application is running on: http://localhost:${port}`);
    console.log(`📚 Swagger documentation: http://localhost:${port}/docs`);
  });
}
