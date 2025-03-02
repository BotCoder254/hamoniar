FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Install serve
RUN npm install -g serve

# Expose port 3000
EXPOSE 3000

# Set environment variable for port
ENV PORT=3000

# Start the application
CMD ["serve", "-s", "build", "-l", "3000"] 