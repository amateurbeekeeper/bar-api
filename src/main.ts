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
      SwaggerModule.setup("api", app, document, {
        swaggerOptions: {
          persistAuthorization: true,
        },
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

export const handler = async (req: any, res: any) => {
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
};
