FROM golang:1.24.1-alpine3.21 AS builder

WORKDIR /app
COPY . .
RUN go build -o pocketbase

FROM alpine:3.21
WORKDIR /app

RUN apk add --no-cache \
    unzip \
    ca-certificates
COPY --from=builder /app/pocketbase /app/pocketbase
COPY ./migrations /app/migrations
EXPOSE 8090
CMD ["/app/pocketbase", "serve", "--http=0.0.0.0:8090"]
