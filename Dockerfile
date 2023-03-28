FROM node:18.3.0

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

COPY package.json .
COPY pnpm-lock.yaml .

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm run build

# remove src folder
RUN rm -rf src

RUN mkdir tmp

EXPOSE 3000

CMD [ "pnpm", "run", "start" ]
