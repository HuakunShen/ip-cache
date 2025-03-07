/// <reference path="../pb_data/types.d.ts" />

// onBootstrap((e) => {
//   const apiKey = $os.getenv("IP_GEOLOCATION_API_KEY");
//   console.log("onBootstrap", e);
//   console.log("apiKey", apiKey);
// });

routerAdd("GET", "/hello/{name}", (e) => {
  let name = e.request?.pathValue("name");
  return e.json(200, { message: "Hello " + name });
});

routerAdd("GET", "/api/basic-ip-info/{ip}", async (e) => {
  const apiKey = $os.getenv("IP_GEOLOCATION_API_KEY");
  const ip = e.request?.pathValue("ip");
  if (!ip) {
    return e.json(400, { error: "IP address is required" });
  }
  const lib = require(`${__hooks}/lib.js`);
  try {
    const record = lib.getCachedRecord(ip);
    if (record && lib.isCacheValid(record)) {
      $app.logger().info("Cache hit for ip: ", { ip });
      return e.json(200, {
        country: record.get("country"),
        latitude: record.get("latitude"),
        longitude: record.get("longitude"),
      });
    }

    const ipInfo = lib.fetchIpInfo(ip, apiKey);
    lib.saveIpRecord(ip, ipInfo);

    return e.json(200, {
      country: ipInfo.country_name,
      latitude: ipInfo.latitude,
      longitude: ipInfo.longitude,
    });
  } catch (error: any) {
    return e.json(500, { error: error.message || "An unknown error occurred" });
  }
});

routerAdd("GET", "/api/full-ip-info/{ip}", async (e) => {
  const apiKey = $os.getenv("IP_GEOLOCATION_API_KEY");
  const ip = e.request?.pathValue("ip");
  if (!ip) {
    return e.json(400, { error: "IP address is required" });
  }
  const lib = require(`${__hooks}/lib.js`);

  try {
    const record = lib.getCachedRecord(ip);
    if (record && lib.isCacheValid(record)) {
      $app.logger().info("Cache hit for ip: ", { ip });
      return e.json(200, record.get("info"));
    }

    const ipInfo = lib.fetchIpInfo(ip, apiKey);
    lib.saveIpRecord(ip, ipInfo);

    return e.json(200, ipInfo);
  } catch (error: any) {
    return e.json(500, { error: error.message || "An unknown error occurred" });
  }
});

onRecordAfterUpdateSuccess((e) => {
  console.log("user updated...", e.record?.get("email"));
  e.next();
}, "users");
