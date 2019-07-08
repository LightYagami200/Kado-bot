FROM node:alpine as builder
WORKDIR /usr/src/app
COPY . ./
RUN npm install react-scripts@3.0.1 -g --silent
RUN npm install --production --silent && mv node_modules ../
RUN npm run build

FROM nginx
EXPOSE 3000
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /usr/src/app/build /usr/share/nginx/html