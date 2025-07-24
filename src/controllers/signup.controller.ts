import {
  Controller,
  Post,
  Body,
  HttpStatus,
  HttpException,
  Logger,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from "@nestjs/swagger";
import { BrowserlessService } from "../services/browserless.service";
import {
  SignupDto,
  SignupResponseDto,
  ErrorResponseDto,
} from "../types/signup.dto";

@ApiTags("Signup")
@Controller()
export class SignupController {
  private readonly logger = new Logger(SignupController.name);

  constructor(private readonly browserlessService: BrowserlessService) {}

  @Post("signup")
  @ApiOperation({
    summary: "Submit a signup form via Browserless automation",
    description:
      "Submits user registration data to a Keela form using Browserless GraphQL API for web automation",
  })
  @ApiBody({
    type: SignupDto,
    description: "User signup information",
  })
  @ApiResponse({
    status: 200,
    description: "Form submitted successfully",
    type: SignupResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: "Validation error - missing or invalid fields",
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: "Internal server error or form submission failure",
    type: ErrorResponseDto,
  })
  async signup(@Body() signupData: SignupDto) {
    try {
      this.logger.log(`Received signup request for ${signupData.email}`);

      // Validate required fields
      if (!signupData.firstName || !signupData.lastName || !signupData.email) {
        throw new HttpException(
          "Missing required fields: firstName, lastName, email",
          HttpStatus.BAD_REQUEST,
        );
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(signupData.email)) {
        throw new HttpException("Invalid email format", HttpStatus.BAD_REQUEST);
      }

      // Submit form via Browserless
      const result = await this.browserlessService.submitForm(signupData);

      if (result.success) {
        this.logger.log(`Signup successful for ${signupData.email}`);
        return {
          success: true,
          message: result.message,
          data: {
            email: signupData.email,
            firstName: signupData.firstName,
            lastName: signupData.lastName,
            isScientist: signupData.isScientist,
          },
        };
      } else {
        this.logger.error(
          `Signup failed for ${signupData.email}: ${result.message}`,
        );
        throw new HttpException(
          {
            success: false,
            message: result.message,
            error: "Form submission failed",
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    } catch (error) {
      this.logger.error(
        `Signup error for ${signupData?.email}: ${error.message}`,
        error.stack,
      );

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        {
          success: false,
          message: "Internal server error",
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
