build:
	docker build . -t ip-geo-pb:latest

run:
	docker run --rm -p 8090:8090 ip-geo-pb:latest