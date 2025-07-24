import { Injectable, Logger } from "@nestjs/common";
import {
  SignupDto,
  BrowserlessResponse,
  FormSubmissionResult,
} from "../types/signup.dto";

@Injectable()
export class BrowserlessService {
  private readonly logger = new Logger(BrowserlessService.name);
  private readonly browserlessUrl =
    "https://production-sfo.browserless.io/chrome/bql";
  private readonly browserlessToken = process.env.BROWSERLESS_TOKEN;
  private readonly keelaEmbedUrl =
    "https://signup-aus.keela.co/embed/GmjpBXbNAsdcsaRco";

  async submitForm(signupData: SignupDto): Promise<FormSubmissionResult> {
    try {
      this.logger.log(`Starting form submission for ${signupData.email}`);

      // Check if we have a valid token
      if (
        !this.browserlessToken ||
        this.browserlessToken === "test_token" ||
        this.browserlessToken === ""
      ) {
        this.logger.warn(
          "No valid Browserless token configured - returning mock success",
        );
        return {
          success: true,
          message:
            "Mock form submission successful (no Browserless token configured)",
          data: {
            firstName: signupData.firstName,
            lastName: signupData.lastName,
            email: signupData.email,
            isScientist: signupData.isScientist,
            submittedAt: new Date().toISOString(),
            mock: true,
          },
        };
      }

      const result = await this.executeFormSubmission(signupData);
      return result;
    } catch (error) {
      this.logger.error(
        `Form submission failed: ${error.message}`,
        error.stack,
      );
      return {
        success: false,
        message: `Form submission failed: ${error.message}`,
      };
    }
  }

  private async executeFormSubmission(
    signupData: SignupDto,
  ): Promise<FormSubmissionResult> {
    const mutation = `
      mutation SubmitKeelaForm {
        goto(url: "${this.keelaEmbedUrl}", waitUntil: networkIdle) {
          status
        }

        waitForForm: waitForSelector(selector: "input[placeholder*='First']", timeout: 30000) {
          selector
          time
        }

        waitForFormLoad: waitForSelector(selector: "input[placeholder*='Last'], input[placeholder*='Email']", timeout: 30000) {
          selector
          time
        }

        typeFirstName: type(selector: "input[placeholder*='First']", text: "${signupData.firstName}") {
          time
        }

        typeLastName: type(selector: "input[placeholder*='Last']", text: "${signupData.lastName}") {
          time
        }

        typeEmail: type(selector: "input[placeholder*='Email']", text: "${signupData.email}") {
          time
        }

        waitForRadios: waitForSelector(selector: "label.form-check-label", timeout: 30000) {
          height
          selector
          time
          y
          x
          width
        }

        clickRadioLabel: click(selector: "label[for$='true']") {
          time
        }

        waitForButton: waitForSelector(selector: "button.btn-form-primary", timeout: 30000) {
          height
          selector
          time
          y
          x
          width
        }

        clickSubmit: click(selector: "button.btn-form-primary") {
          time
        }

        waitAfterSubmit: waitForNavigation(timeout: 15000) {
          status
          time
          text
          url
        }

        html {
          html
          time
        }
      }
    `;

    try {
      this.logger.log(`Sending request to Browserless API: ${this.browserlessUrl}`);
      this.logger.log(`Token configured: ${this.browserlessToken ? 'Yes' : 'No'}`);

                        const response = await fetch(`${this.browserlessUrl}?token=${this.browserlessToken}&proxy=residential&proxySticky=true&proxyCountry=us&humanlike=true&blockConsentModals=true`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: mutation }),
      });

      this.logger.log(`Response status: ${response.status}`);
      this.logger.log(`Response headers: ${JSON.stringify(Object.fromEntries(response.headers.entries()))}`);

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        this.logger.error(`Non-JSON response received: ${text.substring(0, 500)}...`);
        this.logger.error(`This usually means the API URL is wrong or authentication failed`);
        return {
          success: false,
          message: `Browserless API returned HTML instead of JSON. Check URL and authentication.`,
        };
      }

      const result: BrowserlessResponse = await response.json();

      if (result.errors) {
        this.logger.error("Form submission mutation failed:", result.errors);
        return {
          success: false,
          message: `GraphQL errors: ${result.errors.map((e) => e.message).join(", ")}`,
        };
      }

      // Check if any step failed - look for null/undefined values or errors
      const steps = result.data;
      const failedSteps = Object.entries(steps).filter(
        ([key, value]) =>
          key !== "html" &&
          (value === null ||
            value === undefined ||
            (typeof value === "object" && "error" in value)),
      );

      if (failedSteps.length > 0) {
        this.logger.warn("Some form submission steps failed:", failedSteps);
        return {
          success: false,
          message: `Form submission steps failed: ${failedSteps.map(([key]) => key).join(", ")}`,
        };
      }

      // Check for success indicators in the final HTML
      const finalHtml = result.data?.html?.html || "";
      const hasSuccess =
        finalHtml.includes("success") ||
        finalHtml.includes("thank") ||
        finalHtml.includes("submitted") ||
        finalHtml.includes("Thank you") ||
        finalHtml.includes("Success");

      return {
        success: hasSuccess,
        message: hasSuccess
          ? "Form submitted successfully"
          : "Form submission may have failed",
        data: {
          html: finalHtml.substring(0, 1000), // Limit HTML length
          url: result.data?.waitAfterSubmit?.url,
        },
      };
    } catch (error) {
      this.logger.error("Error executing form submission:", error);
      return {
        success: false,
        message: `Execution error: ${error.message}`,
      };
    }
  }

  private getRadioButtonSelection(isScientist: boolean): string {
    const selector = isScientist ? "label[for$='true']" : "label[for$='false']";

    return `
      clickRadioLabel: click(selector: "${selector}") {
        time
      }
    `;
  }
}
