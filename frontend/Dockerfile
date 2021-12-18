# Pull image with node installed
FROM node:17-alpine

# Set work dir
WORKDIR /app

# Add `/app/node_modules/.bin` to $PATH 
ENV PATH /app/node_modules/.bin:$PATH

# Update npm
RUN npm install -g npm@latest

# Install dependencies
ADD package.json /app/package.json
ADD package-lock.json /app/package-lock.json
RUN npm install

# Copy the rest of the app
ADD . /app

# Run the app
RUN chmod +x entrypoint.sh
ENTRYPOINT ["/app/entrypoint.sh"]