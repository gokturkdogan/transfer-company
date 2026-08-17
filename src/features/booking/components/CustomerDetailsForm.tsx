"use client";

import { useTranslations } from "next-intl";

import { BookingFormField } from "@/features/booking/components/BookingFormField";
import { BookingInput } from "@/features/booking/components/BookingInput";
import { BookingFormSection } from "@/features/booking/components/BookingFormSection";
import { PhoneNumberField } from "@/features/booking/components/PhoneNumberField";
import { useBookingFlow } from "@/features/booking/context/booking-flow-context";
import { bookingFormControlErrorClass } from "@/features/booking/components/booking-form-styles";
import { UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

export function CustomerDetailsForm() {
  const t = useTranslations("booking.customer");
  const { state, dispatch } = useBookingFlow();
  const { customer } = state;

  const highlightFullName = state.fieldHighlight === "customer.fullName";
  const highlightEmail = state.fieldHighlight === "customer.email";
  const highlightPhone = state.fieldHighlight === "customer.phone";

  return (
    <BookingFormSection
      title={t("title")}
      description={t("subtitle")}
      icon={<UserRound className="h-4 w-4" aria-hidden />}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <BookingFormField label={t("fullName")} htmlFor="full-name" required>
          <BookingInput
            id="full-name"
            autoComplete="name"
            value={customer.fullName}
            className={cn(highlightFullName && bookingFormControlErrorClass)}
            onChange={(event) =>
              dispatch({
                type: "UPDATE_CUSTOMER",
                customer: { fullName: event.target.value },
              })
            }
          />
        </BookingFormField>
        <BookingFormField label={t("email")} htmlFor="email" required>
          <BookingInput
            id="email"
            type="email"
            autoComplete="email"
            value={customer.email}
            className={cn(highlightEmail && bookingFormControlErrorClass)}
            onChange={(event) =>
              dispatch({
                type: "UPDATE_CUSTOMER",
                customer: { email: event.target.value },
              })
            }
          />
        </BookingFormField>
        <PhoneNumberField
          id="phone"
          className="sm:col-span-1"
          label={t("phone")}
          required
          countryCode={customer.phoneCountryCode}
          nationalNumber={customer.phone}
          placeholder={t("phonePlaceholder")}
          highlight={highlightPhone}
          onCountryCodeChange={(phoneCountryCode) =>
            dispatch({
              type: "UPDATE_CUSTOMER",
              customer: { phoneCountryCode },
            })
          }
          onNationalNumberChange={(phone) =>
            dispatch({
              type: "UPDATE_CUSTOMER",
              customer: { phone },
            })
          }
        />
        <PhoneNumberField
          id="secondary-phone"
          className="sm:col-span-1"
          label={t("secondaryPhone")}
          countryCode={customer.secondaryPhoneCountryCode}
          nationalNumber={customer.secondaryPhone}
          placeholder={t("phonePlaceholder")}
          onCountryCodeChange={(secondaryPhoneCountryCode) =>
            dispatch({
              type: "UPDATE_CUSTOMER",
              customer: { secondaryPhoneCountryCode },
            })
          }
          onNationalNumberChange={(secondaryPhone) =>
            dispatch({
              type: "UPDATE_CUSTOMER",
              customer: { secondaryPhone },
            })
          }
        />
      </div>
    </BookingFormSection>
  );
}
