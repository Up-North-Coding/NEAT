FROM node:14-alpine

RUN apk add --update sudo bash

# Create an unpriv user for meteor to run as
RUN chown -R node:node /home/node
RUN echo 'node ALL=(ALL) NOPASSWD: ALL' >> /etc/sudoers

# Make our source directory and chown it to the new user
RUN mkdir /app
RUN chown node:node /app

# Drop privs to the node user
USER node

# Make /app the working directory
WORKDIR /app

COPY --chown=node:node src/package.json /src/package.json
RUN npm install

# Now copy all of the src into /app
COPY --chown=node:node src/ /app

EXPOSE 3000

CMD ["npm", "run", "test"]
