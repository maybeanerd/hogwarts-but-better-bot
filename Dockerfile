FROM node:20.12.0
WORKDIR /app

# Intall dependencies
COPY ["package.json", "package-lock.json*", "./"]
RUN npm ci

# Build
COPY . .
RUN npm run build

# Start service
CMD ["npm", "run", "start"]