// index.ts
async function getIpInfo(ip) {
  const response = await fetch(`https://ip-cache.huakun.tech/api/info/${ip}`);
  const data = await response.json();
  console.log(data);
}
async function getIpGeoInfo(ip) {
  const response = await fetch(`https://ip-cache.huakun.tech/api/ip-geo/${ip}`);
  const data = await response.json();
  console.log(data);
}
if (import.meta.main) {}
export {
  getIpInfo,
  getIpGeoInfo
};
