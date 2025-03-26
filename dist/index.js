export class IpCache {
    constructor(url = "http://localhost:8090") {
        this.url = url;
    }
    async getIpInfo(ip) {
        const response = await fetch(`${this.url}/api/info/${ip}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch IP info for ${ip}`);
        }
        const data = await response.json();
        if (!data.ip || data.ip === "") {
            throw new Error(`Failed to fetch IP info for ${ip}`);
        }
        return data;
    }
    async getIpGeoInfo(ip) {
        const response = await fetch(`${this.url}/api/ip-geo/${ip}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch IP geo info for ${ip}`);
        }
        const data = await response.json();
        if (!data.latitude || data.latitude === "") {
            throw new Error(`Failed to fetch IP geo info for ${ip}`);
        }
        return data;
    }
}
//# sourceMappingURL=index.js.map