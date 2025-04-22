FROM node:current-slim

RUN npm -g install pnpm

RUN apt-get update && apt-get install -y bash

WORKDIR /app

ENV TZ=Asia/Shanghai

ENTRYPOINT ["pnpm", "run", "preview"]