FROM postgres
ENV POSTGRES_PASSWORD "JaiAvi10:14"
EXPOSE 5432
RUN service postgresql start
USER postgres
RUN /etc/init.d/postgresql start &&\
    psql --command "CREATE USER postgres WITH SUPERUSER PASSWORD 'JaiAvi10:14';" &&\
    createdb -O myuser mydb
USER root

FROM node:18-alpine AS build
WORKDIR /srv
ADD package.json .
RUN npm install typescript -g
RUN npm install
ADD . .
RUN npm run build

FROM node:18-alpine
COPY --from=build /srv .
EXPOSE 3000
CMD ["node", "index.js"]