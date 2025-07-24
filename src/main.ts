import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";

let app: any;

async function bootstrap() {
  if (!app) {
    app = await NestFactory.create(AppModule);

    // Enable CORS for Vercel deployment
    app.enableCors({
      origin: true,
      methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
      credentials: true,
    });

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

    await app.init();
  }
  return app;
}

export const handler = async (req: any, res: any) => {
  try {
    const app = await bootstrap();
    const expressApp = app.getHttpAdapter().getInstance();
    return expressApp(req, res);
  } catch (error) {
    console.error('Handler error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
