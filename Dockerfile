FROM node:alpine
RUN apk add --no-cache --update sqlite
WORKDIR /opt/app
COPY src/package.json src/package-lock.json .
RUN npm install
COPY src/ .
EXPOSE 3000
VOLUME /opt/app/data
CMD ["/opt/app/entrypoint.sh"]
