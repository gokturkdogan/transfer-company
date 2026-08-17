import "server-only";

import { eq } from "drizzle-orm";

import type { Database } from "@/db/client";
import {
  FOOTER_SETTINGS_SINGLETON_ID,
  footerSettings,
} from "@/db/schema/footer-settings";

export type FooterSettingsRecord = {
  tursabLicenseNumber: string;
};

export class FooterSettingsRepository {
  constructor(private readonly database: Database) {}

  async get(): Promise<FooterSettingsRecord> {
    const [row] = await this.database
      .select({
        tursabLicenseNumber: footerSettings.tursabLicenseNumber,
      })
      .from(footerSettings)
      .where(eq(footerSettings.id, FOOTER_SETTINGS_SINGLETON_ID))
      .limit(1);

    if (row) {
      return row;
    }

    await this.database.insert(footerSettings).values({
      id: FOOTER_SETTINGS_SINGLETON_ID,
      tursabLicenseNumber: "",
    });

    return { tursabLicenseNumber: "" };
  }

  async updateTursabLicenseNumber(
    tursabLicenseNumber: string,
  ): Promise<FooterSettingsRecord> {
    const value = tursabLicenseNumber.trim();

    await this.database
      .insert(footerSettings)
      .values({
        id: FOOTER_SETTINGS_SINGLETON_ID,
        tursabLicenseNumber: value,
      })
      .onConflictDoUpdate({
        target: footerSettings.id,
        set: { tursabLicenseNumber: value },
      });

    return { tursabLicenseNumber: value };
  }
}
