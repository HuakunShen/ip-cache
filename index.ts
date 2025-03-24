// import * as v from "valibot";
import PocketBase from "pocketbase";

// export const IpGeoResPonseSchema = v.object({
//   country: v.string(),
//   latitude: v.number(),
//   longitude: v.number(),
// });

// export const IpGeoResPonseSchemaTransformer = v.object({
//   ...IpGeoResPonseSchema.entries,
//   latitude: v.pipe(v.unknown(), v.transform(Number)),
//   longitude: v.pipe(v.unknown(), v.transform(Number)),
// });
const url = "http://localhost:8090";
// const url = "https://ip-cache.huakun.tech";
export async function getIpInfo(ip: string) {
  const response = await fetch(`${url}/api/info/${ip}`);
  const data = await response.json();
  console.log(data);
}

export async function getIpGeoInfo(ip: string) {
  const response = await fetch(`${url}/api/ip-geo/${ip}`);
  const data = await response.json();
  console.log(data);
  return data;
}

if (import.meta.main) {
    const pb = new PocketBase("https://ip-cache.huakun.tech");
    
    // Create a new admin user
    try {
      const adminData = {
        email: "admin@example.com",
        password: "strongpassword123",
        passwordConfirm: "strongpassword123",
      };
      
      const createdAdmin = await pb.collection("_superusers").create(adminData);
      console.log("Admin created successfully:", createdAdmin);
    } catch (error) {
      console.error("Error creating admin:", error);
    }
    
    // You can still get the IP list if needed
    const ips = await pb.collection("ips").getFullList();
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
