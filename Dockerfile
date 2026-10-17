# Both base images are pinned by digest as well as tag, so every build of a commit uses the same
# images and Dependabot proposes each rebuilt image as a reviewed update that cuts a release (#317).
FROM node:26-alpine@sha256:6f08a523443ddedf52941874c203475b0ad503e859ad70cb26ab8be9a517dbd5 AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
RUN npm run build

# Static site: serve the prerendered output with an unprivileged nginx.
FROM nginxinc/nginx-unprivileged:1-alpine@sha256:378d0c32f6562f7fd9629170797f57d2b953aa09be983b3daaf4809bb039ca00
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY docker/security-headers.conf /etc/nginx/snippets/security-headers.conf
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -t 1 --spider http://localhost:8080/ || exit 1
