FROM node:20.2.0-slim
WORKDIR /var/www
ENV NODE_ENV production
ADD --chown=node:node ./index.html /var/www/index.html
ADD --chown=node:node ./src /var/www/src/
ADD --chown=node:node ./package.json  /var/www/package.json
ADD --chown=node:node ./vite.config.js  /var/www/vite.config.js
ADD --chown=node:node ./public/ /var/www/public
RUN npm i --include=dev
RUN chown node:node -R node_modules package-lock.json
RUN npm run build
ENTRYPOINT [  "/usr/local/bin/node", "/var/www/src/server/main.js" ]
#ENTRYPOINT ["sleep", "500"]

