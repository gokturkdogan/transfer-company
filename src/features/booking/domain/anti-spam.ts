export type AntiSpamInput = {
  website?: string;
  formStartedAt?: number;
};

const MINIMUM_FORM_FILL_MS = 3_000;

export function assertAntiSpamChecks(input: AntiSpamInput): void {
  if (input.website && input.website.length > 0) {
    throw new Error("Spam detected");
  }

  if (
    input.formStartedAt &&
    Date.now() - input.formStartedAt < MINIMUM_FORM_FILL_MS
  ) {
    throw new Error("Form submitted too quickly");
  }
}
