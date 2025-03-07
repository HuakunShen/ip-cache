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

routerAdd("GET", "/api/full-ip-info/{ip}", (e) => {
  const apiKey = $os.getenv("IP_GEOLOCATION_API_KEY");
  $app.logger().debug(`apiKey: ${apiKey}`);
  const ip = e.request?.pathValue("ip");
  if (!ip) {
    return e.json(400, { error: "IP address is required" });
  }
  // fetch from DB
  let record;
  try {
    record = $app.findFirstRecordByData("ips", "ip", ip);
    const updated = new Date(record.get("updated"));
    if (updated > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) {
      // if updated within a week
      $app.logger().info("Cache hit for ip: ", { ip });
      console.log(`Cache hit for ip: ${ip}`);
      return e.json(200, record.get("info"));
    } else {
      console.log(`Cache miss for ip: ${ip}`);
    }
  } catch (error) {}
  const url = `https://api.ipgeolocation.io/ipgeo?apiKey=${apiKey}&ip=${ip}`;
  $app.logger().info("Sending request to ipgeolocation: ", { url });
  const response = $http.send({
    url,
    method: "GET",
  });
  if (response.statusCode !== 200) {
    $app.logger().error("Failed to fetch IP geolocation data: ", {
      statusCode: response.statusCode,
      body: response.raw,
    });
    return e.json(500, { error: "Failed to fetch IP geolocation data" });
  }
  const ipInfo = response.json;
  $app.logger().debug("IP geolocation data: ", { ipInfo });
  if (!record) {
    let collection = $app.findCollectionByNameOrId("ips");
    record = new Record(collection);
  }
  record.set("ip", ip);
  record.set("info", ipInfo);
  record.set("country", ipInfo.country_name);
  record.set("latitude", ipInfo.latitude);
  record.set("longitude", ipInfo.longitude);
  $app.save(record);

  return e.json(200, response.json);
});

onRecordAfterUpdateSuccess((e) => {
  console.log("user updated...", e.record?.get("email"));
  e.next();
}, "users");
