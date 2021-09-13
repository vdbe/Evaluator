FROM node:16
RUN useradd -u 8877 bot
WORKDIR /docker/evaluator
COPY package.json /docker/evaluator
RUN npm install
COPY . /docker/evaluator
RUN chmod -R 400 /docker
CMD node eval.js