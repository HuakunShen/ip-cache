# ip-geo-cache-pb

This is a IP to geolocation lookup server with cache.

IP info APIs costs money. e.g. ipgeolocation.io has a free tier of 30k requests/month

It's hard to request 30k unique ips in a month, but if the same ip address is checked frequently the free quota could be used up quickly. Thus I built this simple cache server. This cache server is used as a proxy server, requests sent to `/api/<:ip>` is forwarded to API service and cached in pocketbase.

```bash
make build # build docker image
make run # run docker image on port 8090
```

## Usage

I wrote 2 versions, one with go and one with js hook.

Go is more performant, more flexible and easier to add more features.
The JS hook version is created to deploy to pockethost.

- `http://localhost:8090/api/info/1.1.1.1`
- `http://localhost:8090/api/ip-geo/1.1.1.1`

To switch languages, please remove `pb_data` first.

## Usage (Go)

Install `air` and run `air` to develop.

## Usage (JS Hook)

To develop locally,

1. Run `bun dev`
2. Download pocketbase 0.25.\* to root and run `./pocketbase serve`.

To deploy to pockethost, copy the `pb_migrations` and `pb_hooks` to pockethost with FTP.
