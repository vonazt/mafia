FROM node:12.14.1

LABEL author="Richard Tzanov"

COPY . /app
WORKDIR /app

RUN yarn

EXPOSE 3000

ENTRYPOINT ["yarn", "start"]