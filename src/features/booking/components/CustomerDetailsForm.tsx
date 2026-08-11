"use client";

import { UserRound } from "lucide-react";
import { useTranslations } from "next-intl";

import { BookingFormField } from "@/features/booking/components/BookingFormField";
import { BookingFormSection } from "@/features/booking/components/BookingFormSection";
import { BookingInput } from "@/features/booking/components/BookingInput";
import { PhoneNumberField } from "@/features/booking/components/PhoneNumberField";
import { useBookingFlow } from "@/features/booking/context/booking-flow-context";
import {
  formatFullName,
  parseFullName,
} from "@/features/booking/lib/parse-full-name";

export function CustomerDetailsForm() {
  const t = useTranslations("booking.customer");
  const { state, dispatch } = useBookingFlow();
  const { customer } = state;

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
            value={formatFullName(customer.firstName, customer.lastName)}
            onChange={(event) => {
              const { firstName, lastName } = parseFullName(event.target.value);

              dispatch({
                type: "UPDATE_CUSTOMER",
                customer: { firstName, lastName },
              });
            }}
          />
        </BookingFormField>
        <BookingFormField label={t("email")} htmlFor="email" required>
          <BookingInput
            id="email"
            type="email"
            autoComplete="email"
            value={customer.email}
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
