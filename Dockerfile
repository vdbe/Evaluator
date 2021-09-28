# Created by NotMe


FROM node:16-alpine

ENV CHROME_BIN="/usr/bin/chromium-browser"\
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD="true"

# Install 'evalutors'
RUN apk update && \
    apk add --no-cache \
    gcc \
    g++ \
    php \
    python3 \
    rust \
    iptables \
    ip6tables 


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
