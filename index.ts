// import * as v from "valibot";
import PocketBase from "pocketbase";
import type { TypedPocketBase } from "./pocketbase-types";

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

export interface IpInfo {
  ip: string;
  hostname: string;
  continent_code: string;
  continent_name: string;
  country_code2: string;
  country_code3: string;
  country_name: string;
  country_capital: string;
  state_prov: string;
  district: string;
  city: string;
  zipcode: string;
  latitude: string;
  longitude: string;
  is_eu: boolean;
  calling_code: string;
  country_tld: string;
  languages: string;
  country_flag: string;
  geoname_id: string;
  isp: string;
  connection_type: string;
  organization: string;
  asn: string;
  currency: {
    code: string;
    name: string;
    symbol: string;
  };
  time_zone: {
    name: string;
    offset: number;
    current_time: string;
    current_time_unix: number;
    is_dst: boolean;
    dst_savings: number;
  };
}
export class IpCache {
  private url: string;

  constructor(url: string = "http://localhost:8090") {
    this.url = url;
  }

  async getIpInfo(ip: string): Promise<IpInfo> {
    const response = await fetch(`${this.url}/api/info/${ip}`);
    const data = await response.json();
    return data;
  }

  async getIpGeoInfo(ip: string): Promise<{
    country: string;
    latitude: number;
    longitude: number;
  }> {
    const response = await fetch(`${this.url}/api/ip-geo/${ip}`);
    const data = await response.json();
    return data;
  }
}

if (import.meta.main) {
  const pb = new PocketBase("https://ip-cache.huakun.tech") as TypedPocketBase;
  const ipCache = new IpCache();
  const ipInfo = await ipCache.getIpInfo("112.120.123.149");
  console.log(ipInfo);
  const ipGeoInfo = await ipCache.getIpGeoInfo("112.120.123.149");
  console.log(ipGeoInfo);
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
