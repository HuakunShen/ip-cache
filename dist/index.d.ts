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
export declare class IpCache {
    private url;
    constructor(url?: string);
    getIpInfo(ip: string): Promise<IpInfo>;
    getIpGeoInfo(ip: string): Promise<IpGeoInfo>;
}
//# sourceMappingURL=index.d.ts.map