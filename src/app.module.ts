import { Module } from "@nestjs/common";
import { SignupController } from "./controllers/signup.controller";
import { BrowserlessService } from "./services/browserless.service";

@Module({
  imports: [],
  controllers: [SignupController],
  providers: [BrowserlessService],
})
export class AppModule {}
