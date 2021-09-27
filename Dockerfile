# Created by NotMe


FROM node:16-alpine

# Install 'evalutors'
RUN apk update && \
    apk add --no-cache \
    gcc \
    g++ \
    php \
    python3 \
    rust \
    iptables \
    ip6tables \
# For puppeteer: https://github.com/puppeteer/puppeteer/blob/main/docs/troubleshooting.md#running-on-alpine
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
# /

# Setup userENV USER=docker
ENV UID=8877
ENV GID=8877
ENV USER=runner

# Add user
RUN addgroup --gid $GID -S $USER
RUN adduser \
    -s /bin/nologin \
    --disabled-password \
    --gecos "" \
    --ingroup "$USER" \
    --uid "$UID" \
    -H \
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
