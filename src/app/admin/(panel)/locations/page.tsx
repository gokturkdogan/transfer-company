import Link from "next/link";

import { db } from "@/db/client";
import { LocationAdminRepository } from "@/features/admin/server/location-admin-repository";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const locationAdminRepository = new LocationAdminRepository(db);

const LOCATION_TABS = [
  { value: "airports", label: "Airports", type: "AIRPORT" as const },
  { value: "cities", label: "Cities", type: "CITY" as const },
  { value: "districts", label: "Districts", type: "DISTRICT" as const },
  { value: "hotels", label: "Hotels", type: "HOTEL" as const },
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Locations</h1>
        <p className="text-sm text-muted-foreground">
          Manage airports, cities, districts, and hotels.
        </p>
      </div>

      <Tabs defaultValue="airports">
        <TabsList>
          {LOCATION_TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {LOCATION_TABS.map((tab) => (
          <TabsContent key={tab.value} value={tab.value}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{tab.label}</CardTitle>
                <Button asChild size="sm">
                  <Link href={`/admin/locations/${tab.value}/new`}>Add new</Link>
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Parent</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
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
                              location.isActive ? "default" : "destructive"
                            }
                          >
                            {location.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button asChild variant="outline" size="sm">
                            <Link
                              href={`/admin/locations/${tab.value}/${location.id}/edit`}
                            >
                              Edit
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
