var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __moduleCache = /* @__PURE__ */ new WeakMap;
var __toCommonJS = (from) => {
  var entry = __moduleCache.get(from), desc;
  if (entry)
    return entry;
  entry = __defProp({}, "__esModule", { value: true });
  if (from && typeof from === "object" || typeof from === "function")
    __getOwnPropNames(from).map((key) => !__hasOwnProp.call(entry, key) && __defProp(entry, key, {
      get: () => from[key],
      enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
    }));
  __moduleCache.set(from, entry);
  return entry;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, {
      get: all[name],
      enumerable: true,
      configurable: true,
      set: (newValue) => all[name] = () => newValue
    });
};

// src/lib.ts
var exports_lib = {};
__export(exports_lib, {
  saveIpRecord: () => saveIpRecord,
  isCacheValid: () => isCacheValid,
  getCachedRecord: () => getCachedRecord,
  fetchIpInfo: () => fetchIpInfo
});
module.exports = __toCommonJS(exports_lib);
function getCachedRecord(ip) {
  try {
    return $app.findFirstRecordByData("ips", "ip", ip);
  } catch (error) {
    return null;
  }
}
function isCacheValid(record) {
  const updated = new Date(record.get("updated"));
  return updated > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
}
function fetchIpInfo(ip, apiKey) {
  const url = `https://api.ipgeolocation.io/ipgeo?apiKey=${apiKey}&ip=${ip}`;
  $app.logger().info("Sending request to ipgeolocation: ", { url });
  const response = $http.send({
    url,
    method: "GET"
  });
  if (response.statusCode !== 200) {
    $app.logger().error("Failed to fetch IP geolocation data: ", {
      statusCode: response.statusCode,
      body: response.raw
    });
    throw new Error("Failed to fetch IP geolocation data");
  }
  return response.json;
}
function saveIpRecord(ip, ipInfo) {
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

//# debugId=D39A9E884D28CC7E64756E2164756E21
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL2xpYi50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsKICAgICIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vcGJfZGF0YS90eXBlcy5kLnRzXCIgLz5cblxuLy8gSGVscGVyIGZ1bmN0aW9uc1xuZXhwb3J0IGZ1bmN0aW9uIGdldENhY2hlZFJlY29yZChpcDogc3RyaW5nKSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuICRhcHAuZmluZEZpcnN0UmVjb3JkQnlEYXRhKFwiaXBzXCIsIFwiaXBcIiwgaXApO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHJldHVybiBudWxsO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0NhY2hlVmFsaWQocmVjb3JkOiBhbnkpIHtcbiAgY29uc3QgdXBkYXRlZCA9IG5ldyBEYXRlKHJlY29yZC5nZXQoXCJ1cGRhdGVkXCIpKTtcbiAgcmV0dXJuIHVwZGF0ZWQgPiBuZXcgRGF0ZShEYXRlLm5vdygpIC0gNyAqIDI0ICogNjAgKiA2MCAqIDEwMDApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZmV0Y2hJcEluZm8oaXA6IHN0cmluZywgYXBpS2V5OiBzdHJpbmcpIHtcbiAgY29uc3QgdXJsID0gYGh0dHBzOi8vYXBpLmlwZ2VvbG9jYXRpb24uaW8vaXBnZW8/YXBpS2V5PSR7YXBpS2V5fSZpcD0ke2lwfWA7XG4gICRhcHAubG9nZ2VyKCkuaW5mbyhcIlNlbmRpbmcgcmVxdWVzdCB0byBpcGdlb2xvY2F0aW9uOiBcIiwgeyB1cmwgfSk7XG5cbiAgY29uc3QgcmVzcG9uc2UgPSAkaHR0cC5zZW5kKHtcbiAgICB1cmwsXG4gICAgbWV0aG9kOiBcIkdFVFwiLFxuICB9KTtcblxuICBpZiAocmVzcG9uc2Uuc3RhdHVzQ29kZSAhPT0gMjAwKSB7XG4gICAgJGFwcC5sb2dnZXIoKS5lcnJvcihcIkZhaWxlZCB0byBmZXRjaCBJUCBnZW9sb2NhdGlvbiBkYXRhOiBcIiwge1xuICAgICAgc3RhdHVzQ29kZTogcmVzcG9uc2Uuc3RhdHVzQ29kZSxcbiAgICAgIGJvZHk6IHJlc3BvbnNlLnJhdyxcbiAgICB9KTtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJGYWlsZWQgdG8gZmV0Y2ggSVAgZ2VvbG9jYXRpb24gZGF0YVwiKTtcbiAgfVxuXG4gIHJldHVybiByZXNwb25zZS5qc29uO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2F2ZUlwUmVjb3JkKGlwOiBzdHJpbmcsIGlwSW5mbzogYW55KSB7XG4gIGxldCByZWNvcmQgPSBnZXRDYWNoZWRSZWNvcmQoaXApO1xuICBpZiAoIXJlY29yZCkge1xuICAgIGxldCBjb2xsZWN0aW9uID0gJGFwcC5maW5kQ29sbGVjdGlvbkJ5TmFtZU9ySWQoXCJpcHNcIik7XG4gICAgcmVjb3JkID0gbmV3IFJlY29yZChjb2xsZWN0aW9uKTtcbiAgfVxuXG4gIHJlY29yZC5zZXQoXCJpcFwiLCBpcCk7XG4gIHJlY29yZC5zZXQoXCJpbmZvXCIsIGlwSW5mbyk7XG4gIHJlY29yZC5zZXQoXCJjb3VudHJ5XCIsIGlwSW5mby5jb3VudHJ5X25hbWUpO1xuICByZWNvcmQuc2V0KFwibGF0aXR1ZGVcIiwgaXBJbmZvLmxhdGl0dWRlKTtcbiAgcmVjb3JkLnNldChcImxvbmdpdHVkZVwiLCBpcEluZm8ubG9uZ2l0dWRlKTtcblxuICAkYXBwLnNhdmUocmVjb3JkKTtcbiAgcmV0dXJuIHJlY29yZDtcbn1cbiIKICBdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFHTyxTQUFTLGVBQWUsQ0FBQyxJQUFZO0FBQzFDLE1BQUk7QUFDRixXQUFPLEtBQUssc0JBQXNCLE9BQU8sTUFBTSxFQUFFO0FBQUEsV0FDMUMsT0FBUDtBQUNBLFdBQU87QUFBQTtBQUFBO0FBSUosU0FBUyxZQUFZLENBQUMsUUFBYTtBQUN4QyxRQUFNLFVBQVUsSUFBSSxLQUFLLE9BQU8sSUFBSSxTQUFTLENBQUM7QUFDOUMsU0FBTyxVQUFVLElBQUksS0FBSyxLQUFLLElBQUksSUFBSSxJQUFJLEtBQUssS0FBSyxLQUFLLElBQUk7QUFBQTtBQUd6RCxTQUFTLFdBQVcsQ0FBQyxJQUFZLFFBQWdCO0FBQ3RELFFBQU0sTUFBTSw2Q0FBNkMsYUFBYTtBQUN0RSxPQUFLLE9BQU8sRUFBRSxLQUFLLHNDQUFzQyxFQUFFLElBQUksQ0FBQztBQUVoRSxRQUFNLFdBQVcsTUFBTSxLQUFLO0FBQUEsSUFDMUI7QUFBQSxJQUNBLFFBQVE7QUFBQSxFQUNWLENBQUM7QUFFRCxNQUFJLFNBQVMsZUFBZSxLQUFLO0FBQy9CLFNBQUssT0FBTyxFQUFFLE1BQU0seUNBQXlDO0FBQUEsTUFDM0QsWUFBWSxTQUFTO0FBQUEsTUFDckIsTUFBTSxTQUFTO0FBQUEsSUFDakIsQ0FBQztBQUNELFVBQU0sSUFBSSxNQUFNLHFDQUFxQztBQUFBLEVBQ3ZEO0FBRUEsU0FBTyxTQUFTO0FBQUE7QUFHWCxTQUFTLFlBQVksQ0FBQyxJQUFZLFFBQWE7QUFDcEQsTUFBSSxTQUFTLGdCQUFnQixFQUFFO0FBQy9CLE9BQUssUUFBUTtBQUNYLFFBQUksYUFBYSxLQUFLLHlCQUF5QixLQUFLO0FBQ3BELGFBQVMsSUFBSSxPQUFPLFVBQVU7QUFBQSxFQUNoQztBQUVBLFNBQU8sSUFBSSxNQUFNLEVBQUU7QUFDbkIsU0FBTyxJQUFJLFFBQVEsTUFBTTtBQUN6QixTQUFPLElBQUksV0FBVyxPQUFPLFlBQVk7QUFDekMsU0FBTyxJQUFJLFlBQVksT0FBTyxRQUFRO0FBQ3RDLFNBQU8sSUFBSSxhQUFhLE9BQU8sU0FBUztBQUV4QyxPQUFLLEtBQUssTUFBTTtBQUNoQixTQUFPO0FBQUE7IiwKICAiZGVidWdJZCI6ICJEMzlBOUU4ODREMjhDQzdFNjQ3NTZFMjE2NDc1NkUyMSIsCiAgIm5hbWVzIjogW10KfQ==
