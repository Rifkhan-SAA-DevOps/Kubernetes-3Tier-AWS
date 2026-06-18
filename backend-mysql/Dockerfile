# Use lightweight Node.js image
FROM node:20-alpine

# Create app directory
WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Expose backend port
EXPOSE 5000

# Start application
CMD ["npm", "start"]