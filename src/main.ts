import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";

let app: any;

async function bootstrap() {
  try {
    if (!app) {
      console.log('Creating NestJS application...');
      app = await NestFactory.create(AppModule);

      console.log('Enabling CORS...');
      // Enable CORS for Vercel deployment
      app.enableCors({
        origin: true,
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
        credentials: true,
      });

      console.log('Setting up Swagger...');
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
      
      // Serve OpenAPI JSON
      app.use('/docs-json', (req, res) => {
        res.json(document);
      });
      
      // Serve custom Swagger UI with CDN assets
      app.use('/docs', (req, res) => {
        if (req.path === '/docs') {
          res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <title>Bar API Documentation</title>
                <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.9.0/swagger-ui.css" />
                <style>
                    html { box-sizing: border-box; overflow: -moz-scrollbars-vertical; overflow-y: scroll; }
                    *, *:before, *:after { box-sizing: inherit; }
                    body { margin:0; background: #fafafa; }
                </style>
            </head>
            <body>
                <div id="swagger-ui"></div>
                <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.9.0/swagger-ui-bundle.js"></script>
                <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.9.0/swagger-ui-standalone-preset.js"></script>
                <script>
                    window.onload = function() {
                        const ui = SwaggerUIBundle({
                            url: '/docs-json',
                            dom_id: '#swagger-ui',
                            deepLinking: true,
                            presets: [
                                SwaggerUIBundle.presets.apis,
                                SwaggerUIStandalonePreset
                            ],
                            plugins: [
                                SwaggerUIBundle.plugins.DownloadUrl
                            ],
                            layout: "StandaloneLayout"
                        });
                    };
                </script>
            </body>
            </html>
          `);
        } else {
          res.status(404).send('Not found');
        }
      });

      console.log('Initializing application...');
      await app.init();
      console.log('Application initialized successfully');
    }
    return app;
  } catch (error) {
    console.error('Bootstrap error:', error);
    console.error('Bootstrap error stack:', error.stack);
    throw error;
  }
}

// Vercel serverless function handler
export default async function handler(req: any, res: any) {
  try {
    const app = await bootstrap();
    const expressApp = app.getHttpAdapter().getInstance();
    
    // Handle Vercel's serverless function format
    if (req.body && typeof req.body === 'string') {
      try {
        req.body = JSON.parse(req.body);
      } catch (e) {
        // Ignore parsing errors
      }
    }
    
    return expressApp(req, res);
  } catch (error) {
    console.error('Handler error:', error);
    console.error('Error stack:', error.stack);
    
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Internal server error',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
}

// Local development server startup
if (process.env.NODE_ENV !== 'production') {
  bootstrap().then(async (app) => {
    const port = process.env.PORT || 3000;
    await app.listen(port);
    console.log(`🚀 Application is running on: http://localhost:${port}`);
    console.log(`📚 Swagger documentation: http://localhost:${port}/docs`);
  });
}
