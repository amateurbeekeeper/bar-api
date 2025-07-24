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
    process.env.BROWSERLESS_URL || "https://chrome.browserless.io/graphql";
  private readonly browserlessToken = process.env.BROWSERLESS_TOKEN;
  private readonly keelaEmbedUrl =
    process.env.KEELA_EMBED_URL ||
    "https://signup-aus.keela.co/embed/GmjpBXbNAsdcsaRco";

  async submitForm(signupData: SignupDto): Promise<FormSubmissionResult> {
    try {
      this.logger.log(`Starting form submission for ${signupData.email}`);

      // Check if we have a valid token
      if (!this.browserlessToken || this.browserlessToken === 'test_token') {
        this.logger.warn('No valid Browserless token configured - returning mock success');
        return {
          success: true,
          message: "Mock form submission successful (no Browserless token configured)",
          data: {
            firstName: signupData.firstName,
            lastName: signupData.lastName,
            email: signupData.email,
            isScientist: signupData.isScientist,
            submittedAt: new Date().toISOString(),
            mock: true
          }
        };
      }

      const sessionId = await this.createSession();
      if (!sessionId) {
        return {
          success: false,
          message: "Failed to create browser session",
        };
      }

      const result = await this.executeFormSubmission(sessionId, signupData);

      // Clean up session
      await this.closeSession(sessionId);

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

  private async createSession(): Promise<string | null> {
    const mutation = `
      mutation {
        createSession {
          sessionId
        }
      }
    `;

    try {
      this.logger.log(`Attempting to create session with URL: ${this.browserlessUrl}`);
      this.logger.log(`Token configured: ${this.browserlessToken ? 'Yes' : 'No'}`);

      const response = await fetch(this.browserlessUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.browserlessToken}`,
        },
        body: JSON.stringify({ query: mutation }),
      });

      this.logger.log(`Response status: ${response.status}`);
      this.logger.log(`Response headers: ${JSON.stringify(Object.fromEntries(response.headers.entries()))}`);

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        this.logger.error(`Non-JSON response received: ${text.substring(0, 200)}...`);
        this.logger.error(`This usually means the API URL is wrong or authentication failed`);
        return null;
      }

      const result: BrowserlessResponse = await response.json();

      if (result.errors) {
        this.logger.error("Failed to create session:", result.errors);
        return null;
      }

      const sessionId = result.data?.createSession?.sessionId;
      if (sessionId) {
        this.logger.log(`Session created successfully: ${sessionId}`);
      } else {
        this.logger.error("No session ID in response:", result);
      }

      return sessionId;
    } catch (error) {
      this.logger.error("Error creating session:", error);
      return null;
    }
  }

  private async executeFormSubmission(
    sessionId: string,
    signupData: SignupDto,
  ): Promise<FormSubmissionResult> {
    const mutation = `
      mutation SubmitKeelaForm {
        goto(sessionId: "${sessionId}", url: "${this.keelaEmbedUrl}") {
          status
        }

        typeFirstName: type(sessionId: "${sessionId}", selector: "input[placeholder*='First']", text: "${signupData.firstName}") {
          time
        }

        typeLastName: type(sessionId: "${sessionId}", selector: "input[placeholder*='Last']", text: "${signupData.lastName}") {
          time
        }

        typeEmail: type(sessionId: "${sessionId}", selector: "input[placeholder*='Email']", text: "${signupData.email}") {
          time
        }

        waitForRadios: waitForSelector(sessionId: "${sessionId}", selector: "label.form-check-label", timeout: 5000) {
          height
          selector
          time
          y
          x
          width
        }

        ${this.getRadioButtonSelection(signupData.isScientist, sessionId)}

        waitForButton: waitForSelector(sessionId: "${sessionId}", selector: "button.btn-form-primary", timeout: 5000) {
          height
          selector
          time
          y
          x
          width
        }

        clickSubmit: click(sessionId: "${sessionId}", selector: "button.btn-form-primary") {
          time
        }

        waitAfterSubmit: waitForNavigation(sessionId: "${sessionId}", timeout: 5000) {
          status
          time
          text
          url
        }

        html(sessionId: "${sessionId}") {
          html
          time
        }
      }
    `;

    try {
      const response = await fetch(this.browserlessUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.browserlessToken}`,
        },
        body: JSON.stringify({ query: mutation }),
      });

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

  private getRadioButtonSelection(
    isScientist: boolean,
    sessionId: string,
  ): string {
    const selector = isScientist ? "label[for$='true']" : "label[for$='false']";

    return `
      clickRadioLabel: click(sessionId: "${sessionId}", selector: "${selector}") {
        time
      }
    `;
  }

  private async closeSession(sessionId: string): Promise<void> {
    const mutation = `
      mutation {
        closeSession(sessionId: "${sessionId}") {
          success
        }
      }
    `;

    try {
      await fetch(this.browserlessUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.browserlessToken}`,
        },
        body: JSON.stringify({ query: mutation }),
      });
    } catch (error) {
      this.logger.warn("Failed to close session:", error);
    }
  }
}
