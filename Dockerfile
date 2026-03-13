# 1. Use an official Node.js image as the base
FROM node:20-alpine

# 2. Create an app directory inside the container
WORKDIR /app

# 3. Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# 4. Copy the rest of your code
COPY . .

# 5. Build the Next.js app for production
RUN npm run build

# 6. Expose the port Next.js runs on
EXPOSE 3000

# 7. Command to run the app
CMD ["npm", "start","dev"]