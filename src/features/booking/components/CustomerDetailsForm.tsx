"use client";

import { useTranslations } from "next-intl";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBookingFlow } from "@/features/booking/context/booking-flow-context";

export function CustomerDetailsForm() {
  const t = useTranslations("booking.customer");
  const { state, dispatch } = useBookingFlow();
  const { customer } = state;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="first-name">{t("firstName")}</Label>
        <Input
          id="first-name"
          value={customer.firstName}
          onChange={(event) =>
            dispatch({
              type: "UPDATE_CUSTOMER",
              customer: { firstName: event.target.value },
            })
          }
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="last-name">{t("lastName")}</Label>
        <Input
          id="last-name"
          value={customer.lastName}
          onChange={(event) =>
            dispatch({
              type: "UPDATE_CUSTOMER",
              customer: { lastName: event.target.value },
            })
          }
        />
      </div>
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="email">{t("email")}</Label>
        <Input
          id="email"
          type="email"
          value={customer.email}
          onChange={(event) =>
            dispatch({
              type: "UPDATE_CUSTOMER",
              customer: { email: event.target.value },
            })
          }
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">{t("phone")}</Label>
        <Input
          id="phone"
          value={customer.phone}
          onChange={(event) =>
            dispatch({
              type: "UPDATE_CUSTOMER",
              customer: { phone: event.target.value },
            })
          }
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="whatsapp">{t("whatsapp")}</Label>
        <Input
          id="whatsapp"
          value={customer.whatsappPhone}
          onChange={(event) =>
            dispatch({
              type: "UPDATE_CUSTOMER",
              customer: { whatsappPhone: event.target.value },
            })
          }
        />
      </div>
    </div>
  );
}
