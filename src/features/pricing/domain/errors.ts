export class PricingDomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PricingDomainError";
  }
}
