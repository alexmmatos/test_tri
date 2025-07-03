FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install
# RUN npm install --save-dev ts-node-dev

COPY . .

EXPOSE 3000
CMD ["npm", "start"] 