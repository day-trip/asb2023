FROM node:18-alpine
WORKDIR /usr/src/app
COPY package.json ./
RUN npm install
RUN npm install typescript -g
COPY . .
EXPOSE 4000
RUN npm run build
CMD ["node", "server.js"]