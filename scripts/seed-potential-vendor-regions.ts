#!/usr/bin/env npx tsx
/**
 * Inserts staff "Potential vendor regions" rows (city + state labels).
 * Safe to re-run: skips regions that already exist.
 *
 * Usage:
 *   npx tsx scripts/seed-potential-vendor-regions.ts
 *
 * Requires DATABASE_URL, PAYLOAD_SECRET (e.g. .env.local).
 */
import "dotenv/config";
import { getPayload } from "payload";
import config from "@payload-config";

/** One row per line: "City, ST" — matches staff UI expectation for region label */
const INITIAL_REGIONS: string[] = [
  "Frisco, TX",
  "Plano, TX",
  "Irving, TX",
  "Coppell, TX",
  "Richardson, TX",
  "McKinney, TX",
  "Little Elm, TX",
  "Allen, TX",
  "Flower Mound, TX",
  "Lewisville, TX",
  "Round Rock, TX",
  "Cedar Park, TX",
  "Pflugerville, TX",
  "Leander, TX",
  "Austin, TX",
  "Sugar Land, TX",
  "Katy, TX",
  "Pearland, TX",
  "The Woodlands, TX",
  "Cypress, TX",
  "Richmond, TX",
  "Sunnyvale, CA",
  "Cupertino, CA",
  "Santa Clara, CA",
  "San Jose, CA",
  "Fremont, CA",
  "Pleasanton, CA",
  "Milpitas, CA",
  "Dublin, CA",
  "San Ramon, CA",
  "Foster City, CA",
  "Folsom, CA",
  "Roseville, CA",
  "Rocklin, CA",
  "Edison, NJ",
  "Iselin, NJ",
  "Plainsboro, NJ",
  "Princeton, NJ",
  "Bridgewater, NJ",
  "South Brunswick, NJ",
  "North Brunswick, NJ",
  "Piscataway, NJ",
  "West Windsor, NJ",
  "Ashburn, VA",
  "Herndon, VA",
  "Chantilly, VA",
  "Fairfax, VA",
  "Leesburg, VA",
  "Reston, VA",
  "Sterling, VA",
  "Naperville, IL",
  "Aurora, IL",
  "Schaumburg, IL",
  "Hoffman Estates, IL",
  "Bolingbrook, IL",
  "Lisle, IL",
  "Novi, MI",
  "Farmington Hills, MI",
  "Troy, MI",
  "Northville, MI",
  "Canton, MI",
  "Ann Arbor, MI",
  "Dublin, OH",
  "Mason, OH",
  "Solon, OH",
  "Alpharetta, GA",
  "Johns Creek, GA",
  "Duluth, GA",
  "Suwanee, GA",
  "Cumming, GA",
  "Milton, GA",
  "Morrisville, NC",
  "Cary, NC",
  "Apex, NC",
  "Holly Springs, NC",
  "Raleigh, NC",
  "Redmond, WA",
  "Bellevue, WA",
  "Sammamish, WA",
  "Issaquah, WA",
  "Bothell, WA",
  "Kirkland, WA",
  "Tampa, FL",
  "Orlando, FL",
  "Jacksonville, FL",
  "Shrewsbury, MA",
  "Westford, MA",
  "Acton, MA",
  "Quincy, MA",
  "Eden Prairie, MN",
  "Maple Grove, MN",
  "Plymouth, MN",
  "Chandler, AZ",
  "Gilbert, AZ",
  "Scottsdale, AZ",
  "Overland Park, KS",
  "Olathe, KS",
  "King of Prussia, PA",
  "Upper Merion, PA",
  "Bensalem, PA",
];

async function main() {
  const payload = await getPayload({ config });

  let created = 0;
  let skipped = 0;

  for (let i = 0; i < INITIAL_REGIONS.length; i++) {
    const region = INITIAL_REGIONS[i].trim();
    const existing = await payload.find({
      collection: "potential-vendor-regions",
      where: { region: { equals: region } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    });

    if (existing.docs.length > 0) {
      skipped += 1;
      continue;
    }

    await payload.create({
      collection: "potential-vendor-regions",
      data: {
        region,
        potentialVendors: [],
        order: i,
        isActive: true,
      },
      overrideAccess: true,
    });
    created += 1;
  }

  console.log(
    `Done. Created ${created} region(s). Skipped ${skipped} existing. Total in list: ${INITIAL_REGIONS.length}.`
  );
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
