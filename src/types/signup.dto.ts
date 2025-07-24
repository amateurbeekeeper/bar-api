import { ApiProperty } from "@nestjs/swagger";

export class SignupDto {
  @ApiProperty({
    description: "First name of the user",
    example: "John",
    minLength: 1,
    maxLength: 50,
  })
  firstName: string;

  @ApiProperty({
    description: "Last name of the user",
    example: "Doe",
    minLength: 1,
    maxLength: 50,
  })
  lastName: string;

  @ApiProperty({
    description: "Email address of the user",
    example: "john.doe@example.com",
    format: "email",
  })
  email: string;

  @ApiProperty({
    description: "Whether the user is a scientist",
    example: true,
    default: false,
  })
  isScientist: boolean;
}

export interface BrowserlessResponse {
  data?: any;
  errors?: Array<{
    message: string;
    locations?: Array<{
      line: number;
      column: number;
    }>;
    path?: string[];
  }>;
}

export class SignupResponseDto {
  @ApiProperty({
    description: "Whether the signup was successful",
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: "Response message",
    example: "Form submitted successfully",
  })
  message: string;

  @ApiProperty({
    description: "User data that was submitted",
    example: {
      email: "john.doe@example.com",
      firstName: "John",
      lastName: "Doe",
      isScientist: true,
    },
  })
  data?: {
    email: string;
    firstName: string;
    lastName: string;
    isScientist: boolean;
  };
}

export class ErrorResponseDto {
  @ApiProperty({
    description: "Whether the request was successful",
    example: false,
  })
  success: boolean;

  @ApiProperty({
    description: "Error message",
    example: "Missing required fields: firstName, lastName, email",
  })
  message: string;

  @ApiProperty({
    description: "Error type",
    example: "Validation Error",
    required: false,
  })
  error?: string;
}

export interface FormSubmissionResult {
  success: boolean;
  message: string;
  data?: any;
}
