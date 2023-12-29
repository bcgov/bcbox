ARG APP_ROOT=/opt/app-root/src
ARG BASE_IMAGE=docker.io/node:20.9.0-alpine

#
# Build the app
#
FROM ${BASE_IMAGE} as app

ARG APP_ROOT
ENV NO_UPDATE_NOTIFIER=true

# NPM Permission Fix
RUN mkdir -p /.npm
RUN chown -R 1001:0 /.npm

# Build App
COPY app ${APP_ROOT}
RUN chown -R 1001:0 ${APP_ROOT}
USER 1001
WORKDIR ${APP_ROOT}
RUN npm ci && npm run build

#
# Build the frontend
#
FROM ${BASE_IMAGE} as frontend

ARG APP_ROOT
ENV NO_UPDATE_NOTIFIER=true

# NPM Permission Fix
RUN mkdir -p /.npm
RUN chown -R 1001:0 /.npm

# Build Frontend
COPY frontend ${APP_ROOT}
RUN chown -R 1001:0 ${APP_ROOT}
USER 1001
WORKDIR ${APP_ROOT}
RUN npm ci && npm run build

#
# Create the final container image
#
FROM ${BASE_IMAGE}

ARG APP_ROOT
ENV APP_PORT=8080 \
    NO_UPDATE_NOTIFIER=true

# NPM Permission Fix
RUN mkdir -p /.npm
RUN chown -R 1001:0 /.npm

# Install File Structure
COPY --from=app ${APP_ROOT}/sbin ${APP_ROOT}/sbin
COPY --from=frontend ${APP_ROOT}/dist ${APP_ROOT}/dist
COPY .git ${APP_ROOT}/.git
COPY app/config ${APP_ROOT}/config
COPY app/config ${APP_ROOT}/sbin/config
COPY app/package.json app/package-lock.json ${APP_ROOT}
WORKDIR ${APP_ROOT}

# Install Application
RUN chown -R 1001:0 ${APP_ROOT}
USER 1001
RUN npm ci --omit=dev

EXPOSE ${APP_PORT}
CMD ["node", "./sbin/bin/www"]
