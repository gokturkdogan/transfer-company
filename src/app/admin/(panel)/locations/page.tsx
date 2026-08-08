import Link from "next/link";
import { MapPin } from "lucide-react";

import { db } from "@/db/client";
import { LocationAdminRepository } from "@/features/admin/server/location-admin-repository";
import { AdminContentCard } from "@/features/admin/components/shell/AdminContentCard";
import { AdminPageHeader } from "@/features/admin/components/shell/AdminPageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { adminCopy } from "@/features/admin/copy";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const locationAdminRepository = new LocationAdminRepository(db);

const LOCATION_TABS = [
  { value: "airports", label: adminCopy.locations.tabs.airports, type: "AIRPORT" as const },
  { value: "cities", label: adminCopy.locations.tabs.cities, type: "CITY" as const },
  { value: "districts", label: adminCopy.locations.tabs.districts, type: "DISTRICT" as const },
  { value: "hotels", label: adminCopy.locations.tabs.hotels, type: "HOTEL" as const },
];

export default async function AdminLocationsPage() {
  const [airports, cities, districts, hotels] = await Promise.all([
    locationAdminRepository.findByType("AIRPORT", { includeInactive: true }),
    locationAdminRepository.findByType("CITY", { includeInactive: true }),
    locationAdminRepository.findByType("DISTRICT", { includeInactive: true }),
    locationAdminRepository.findByType("HOTEL", { includeInactive: true }),
  ]);

  const cityById = new Map(cities.map((city) => [city.id, city.defaultName]));
  const districtById = new Map(
    districts.map((district) => [district.id, district.defaultName]),
  );

  const rowsByType = {
    AIRPORT: airports,
    CITY: cities,
    DISTRICT: districts,
    HOTEL: hotels,
  };

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title={adminCopy.locations.title}
        subtitle={adminCopy.locations.subtitle}
        icon={MapPin}
      />

      <Tabs defaultValue="airports">
        <TabsList className="admin-tabs-list">
          {LOCATION_TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="admin-tabs-trigger">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {LOCATION_TABS.map((tab) => (
          <TabsContent key={tab.value} value={tab.value}>
            <AdminContentCard
              title={tab.label}
              action={
                <Button asChild size="sm">
                  <Link href={`/admin/locations/${tab.value}/new`}>
                    {adminCopy.locations.addNew}
                  </Link>
                </Button>
              }
              flush
            >
              <Table className="admin-table">
                  <TableHeader>
                    <TableRow>
                      <TableHead>{adminCopy.locations.table.name}</TableHead>
                      <TableHead>{adminCopy.locations.table.code}</TableHead>
                      <TableHead>{adminCopy.locations.table.parent}</TableHead>
                      <TableHead>{adminCopy.locations.table.status}</TableHead>
                      <TableHead className="text-right">
                        {adminCopy.locations.table.actions}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rowsByType[tab.type].map((location) => (
                      <TableRow key={location.id}>
                        <TableCell className="font-medium">
                          {location.defaultName}
                        </TableCell>
                        <TableCell>{location.code}</TableCell>
                        <TableCell>
                          {tab.type === "DISTRICT"
                            ? (cityById.get(location.parentId ?? "") ?? "—")
                            : tab.type === "HOTEL"
                              ? (districtById.get(location.parentId ?? "") ??
                                "—")
                              : tab.type === "AIRPORT"
                                ? (cityById.get(location.parentId ?? "") ??
                                  "—")
                                : "—"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              location.isActive ? "success" : "destructive"
                            }
                          >
                            {location.isActive
                              ? adminCopy.locations.status.active
                              : adminCopy.locations.status.inactive}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button asChild variant="outline" size="sm">
                            <Link
                              href={`/admin/locations/${tab.value}/${location.id}/edit`}
                            >
                              {adminCopy.locations.table.edit}
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
            </AdminContentCard>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
