/// <reference path="../pb_data/types.d.ts" />

// Helper functions
export function getCachedRecord(ip: string) {
  try {
    return $app.findFirstRecordByData("ips", "ip", ip);
  } catch (error) {
    return null;
  }
}

export function isCacheValid(record: any) {
  const updated = new Date(record.get("updated"));
  return updated > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
}

export function fetchIpInfo(ip: string, apiKey: string) {
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
    throw new Error("Failed to fetch IP geolocation data");
  }

  return response.json;
}

export function saveIpRecord(ip: string, ipInfo: any) {
  let record = getCachedRecord(ip);
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
  return record;
}
