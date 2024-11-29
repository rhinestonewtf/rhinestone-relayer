FROM node:20-slim 
RUN apt-get update && apt-get install -y python3 make gcc g++
RUN corepack enable

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

WORKDIR /app
COPY . .

RUN pnpm install

# will listen on whatever port is passed through ENV or 3000
CMD [ "pnpm","run", "start" ]