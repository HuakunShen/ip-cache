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

export interface IpGeoInfo {
  country: string;
  latitude: string;
  longitude: string;
}

export class IpCache {
  private url: string;

  constructor(url: string = "http://localhost:8090") {
    this.url = url;
  }

  async getIpInfo(ip: string): Promise<IpInfo> {
    const response = await fetch(`${this.url}/api/info/${ip}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch IP info for ${ip}`);
    }
    const data: IpInfo = await response.json();
    if (!data.ip || data.ip === "") {
      throw new Error(`Failed to fetch IP info for ${ip}`);
    }
    return data;
  }

  async getIpGeoInfo(ip: string): Promise<IpGeoInfo> {
    const response = await fetch(`${this.url}/api/ip-geo/${ip}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch IP geo info for ${ip}`);
    }
    const data: IpGeoInfo = await response.json();
    if (!data.latitude || data.latitude === "") {
      throw new Error(`Failed to fetch IP geo info for ${ip}`);
    }
    return data;
  }
}
