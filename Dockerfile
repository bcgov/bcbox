# FROM docker.io/node:16.15.0-alpine # Last known working alpine image

# RedHat Image Catalog references
# https://catalog.redhat.com/software/containers/ubi9/nodejs-18/62e8e7ed22d1d3c2dfe2ca01
# https://catalog.redhat.com/software/containers/ubi9/nodejs-18-minimal/62e8e919d4f57d92a9dee838

#
# Build the application
#
FROM registry.access.redhat.com/ubi9/nodejs-18:1-62.1692771036 as application

ENV NO_UPDATE_NOTIFIER=true

USER 0
COPY app /tmp/src/app
WORKDIR /tmp/src/app
RUN chown -R 1001:0 /tmp/src/app

USER 1001
RUN npm ci --omit=dev

#
# Build the frontend
#
FROM registry.access.redhat.com/ubi9/nodejs-18:1-62.1692771036 as frontend

ENV NO_UPDATE_NOTIFIER=true

USER 0
COPY frontend /tmp/src/frontend
WORKDIR /tmp/src/frontend
RUN chown -R 1001:0 /tmp/src/frontend

USER 1001
RUN npm ci && npm run build

#
# Create the final container image
#
FROM registry.access.redhat.com/ubi9/nodejs-18-minimal:1-67

ENV APP_PORT=8080 \
    NO_UPDATE_NOTIFIER=true

COPY --from=application /tmp/src/app ${HOME}
COPY --from=frontend /tmp/src/frontend/dist ${HOME}/dist
COPY .git ${HOME}/.git
WORKDIR ${HOME}

EXPOSE ${APP_PORT}
CMD ["npm", "run", "start"]
