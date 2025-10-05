FROM golang:1.25.1-alpine3.22.1 AS builder 

WORKDIR /src

COPY go.mod go.sum ./ /buildthisjohnson/
RUN go mod download 

COPY . . 

ENV CGO_ENABLED=0 GOOS=linux GOARCH=amd64

# -ldflags="-s -w" Could add these but I'm not 
# sigma enough to get rid of stack traces. Maybe
# in the future

RUN go build -o /usr/local/bin/app . 

FROM alpine:3.22.1

COPY --from=builder /usr/local/bin/app /usr/local/bin/app

EXPOSE 8080

ENTRYPOINT [ "/usr/local/bin/app" ]