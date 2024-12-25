# ip-geo-cache-pb

This is a IP to geolocation lookup server with cache.

IP info APIs costs money. e.g. ipgeolocation.io has a free tier of 30k requests/month

It's hard to request 30k unique ips in a month, but if the same ip address is checked frequently the free quota could be used up quickly. Thus I built this simple cache server. This cache server is used as a proxy server, requests sent to `/api/<:ip>` is forwarded to API service and cached in pocketbase.

```bash
make build # build docker image
make run # run docker image on port 8090
```

## Usage

Send request to `http://localhost:8090/api/1.1.1.1
