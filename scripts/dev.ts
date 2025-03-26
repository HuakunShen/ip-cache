import * as v from "valibot";
import PocketBase from "pocketbase";
import type { TypedPocketBase } from "../pocketbase-types";
import pLimit from "p-limit";

if (import.meta.main) {
  const pb = new PocketBase(Bun.env.POCKETBASE_URL) as TypedPocketBase;

  // Authenticate as admin
  try {
    const adminEmail = Bun.env.ADMIN_EMAIL || "admin@example.com";
    const adminPassword = Bun.env.ADMIN_PASSWORD || "your-password";
    await pb
      .collection("_superusers")
      .authWithPassword(adminEmail, adminPassword);
    console.log("Authenticated as admin successfully");
    const ips = (await pb.collection("ips").getFullList()).filter(
      (ip) => ip.info !== null && ip.info?.ip === ""
    );
    console.log(`Found ${ips.length} IPs with empty info to delete`);

    // Delete each IP with empty info from the database
    // Create a limit of 5 concurrent operations
    const limit = pLimit(5);

    // Create an array of promises for deletion operations
    const deletePromises = ips.map((ip) =>
      limit(async () => {
        try {
          await pb.collection("ips").delete(ip.id);
          console.log(`Deleted IP record with ID: ${ip.id}`);
        } catch (deleteError) {
          console.error(`Failed to delete IP with ID ${ip.id}:`, deleteError);
        }
      })
    );

    // Wait for all deletion operations to complete
    await Promise.all(deletePromises);

    console.log("Deletion process completed");
    console.log(ips);
  } catch (error) {
    console.error("Admin authentication failed:", error);
  }

  // const ipCache = new IpCache(Bun.env.POCKETBASE_URL);
  // const ipInfo = await ipCache.getIpInfo("112.120.123.149");
  // console.log(ipInfo);
  // const ipGeoInfo = await ipCache.getIpGeoInfo("112.120.123.149");
  // console.log(ipGeoInfo);

  // Create a new admin user
  //   const ips = await pb.collection("ips").getFullList();
  //   console.log(ips);
  //   for (const ip of ips) {
  //     console.log(ip.ip);
  //     getIpInfo(ip.ip);
  //   }
  //   getIpGeoInfo("112.120.123.149");
  //   getIpGeoInfo("154.28.229.97");
  //   getIpGeoInfo("85.208.96.198");
  //   getIpGeoInfo("54.36.149.26");
  //   getIpGeoInfo("185.191.171.1");
}
// bunx pocketbase-typegen --db ./pb_data/data.db
