import { customType } from "drizzle-orm/pg-core";

// PostGIS geography(Point, 4326). Stored/read as WKT text - no location/geofencing
// logic consumes this yet (see product-idea.txt TODO), this only reserves the column.
//
// KNOWN ISSUE: drizzle-kit 0.24.2's isPgNativeType() only whitelists "geometry(" as
// an unquoted parameterized type prefix, not "geography(" - so `drizzle-kit generate`
// emits `"location_point" "geography(Point, 4326)"` (invalid SQL, type name wrongly
// quoted as an identifier). After every `db:generate` run touching this column,
// manually strip the outer quotes in the generated migration:
//   "location_point" "geography(Point, 4326)"  ->  "location_point" geography(Point, 4326)
export const geographyPoint = customType<{ data: string }>({
  dataType() {
    return "geography(Point, 4326)";
  },
});
