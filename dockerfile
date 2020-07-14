FROM node:12-alpine

RUN mkdir /home/node/app/ && chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY --chown=node:node ./package*.json ./

USER node

RUN npm install && npm cache clean --force --loglevel=error

COPY --chown=node:node ./app.js .
COPY --chown=node:node ./bin ./bin/
COPY --chown=node:node ./config ./config/
COPY --chown=node:node ./public ./public/
COPY --chown=node:node ./routes ./routes/
COPY --chown=node:node ./views ./views/

CMD [ "npm", "start"]
