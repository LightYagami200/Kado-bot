FROM node:alpine as builder
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json", "./"]
RUN npm install react-scripts@3.0.1 -g --silent
RUN npm install --production --silent && mv node_modules ../
COPY . ./
RUN npm run build

FROM nginx
EXPOSE 3000
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /usr/src/app/build /usr/share/nginx/html