# Created by NotMe


FROM node:16-alpine

# Install 'evalutors'
RUN apk update && \
    apk add --no-cache \
    gcc \
    g++ \
    python3


# Setup userENV USER=docker
ENV UID=8777
ENV GID=8877
ENV USER=runner

# Add user
RUN addgroup --gid $GID -S $USER
RUN adduser \
    --disabled-password \
    --gecos "" \
    --ingroup "$USER" \
    --uid "$UID" \
    "$USER"

RUN mkdir -p /root/evaluator
WORKDIR /root/evaluator

# Copy required files
COPY ./package.json /root/evaluator/
COPY ./src /root/evaluator/src

RUN npm install

# Copy config last
COPY ./.env /root/evaluator/

ENTRYPOINT ["node", "src/eval.js"]