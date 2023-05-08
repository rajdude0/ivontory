FROM node:slim
WORKDIR /var/www
ENV NODE_ENV production
ADD --chown=node:node ./src/server/ /var/www/src/server
ADD --chown=node:node ./src/client/ /var/www/src/client
ADD --chown=node:node ./package.json  /var/www/package.json
ADD --chown=node:node ./vite.config.js  /var/www/vite.config.js
ADD --chown=node:node ./public/ /var/www/public
RUN npm i 
RUN chown node:node -R node_modules package-lock.json
RUN npm run build
# ENTRYPOINT [  "/usr/local/bin/node", "/var/www/src/server/main.js" ]
ENTRYPOINT "sleep 500"

