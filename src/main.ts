import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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

  // Global prefix if needed
  // app.setGlobalPrefix('api');

  await app.listen(process.env.PORT || 3000);
}

bootstrap();
