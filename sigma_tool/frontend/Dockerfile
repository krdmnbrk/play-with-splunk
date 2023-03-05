FROM node:19-alpine as builder
WORKDIR /app
COPY . .
RUN yarn install
RUN yarn build

FROM nginx:latest
WORKDIR /usr/share/nginx/html
RUN rm -rf ./*
COPY --from=builder /app/build .
ENTRYPOINT [ "nginx", "-g", "daemon off;"]