FROM node:23.7.0-slim 
RUN apt-get update && apt-get install -y python3 make gcc g++ curl unzip

# Install Bun
RUN curl -fsSL https://bun.sh/install | bash

# Add Bun to PATH
ENV PATH="/root/.bun/bin:$PATH"
WORKDIR /app
COPY . .
RUN CI=true bun install

# will listen on whatever port is passed through ENV or 3000
CMD [ "bun", "run", "start" ]
