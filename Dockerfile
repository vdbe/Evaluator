# Created by NotMe


FROM node:16-alpine

# Install 'evalutors'
RUN apk update && \
    apk add --no-cache \
    gcc \
    g++ \
    python3 \
    rust


# Setup userENV USER=docker
ENV UID=8877
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
COPY ./ /root/evaluator/

# Set permissions for root folder
RUN chmod -R 400 /root

RUN npm install

# Copy config last
COPY ./.env /root/evaluator/

ENTRYPOINT ["node", "eval.js"]