FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy ALL files
COPY . .

EXPOSE 4004

CMD ["node", "server.js"]