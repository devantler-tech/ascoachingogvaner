# Both base images are pinned by digest as well as tag, so every build of a commit uses the same
# images and Dependabot proposes each rebuilt image as a reviewed update that cuts a release (#317).
FROM node:26-alpine@sha256:6f08a523443ddedf52941874c203475b0ad503e859ad70cb26ab8be9a517dbd5 AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
RUN npm run build

# Static site: serve the prerendered output with an unprivileged nginx.
FROM nginxinc/nginx-unprivileged:1-alpine@sha256:b5047b9b76845eac124358373c6852377c52e4b05834a47647e955dd91cb8f1e
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY docker/security-headers.conf /etc/nginx/snippets/security-headers.conf
COPY --from=build /app/build /usr/share/nginx/html
# nginx-unprivileged already runs as its nginx user (UID 101); naming it makes the non-root user
# explicit for scanners. deploy/ runs the pod as UID 1000 either way.
USER 101
EXPOSE 8080
# 127.0.0.1, not localhost: inside the image localhost resolves to ::1 first, and nginx listens
# on IPv4 only, so a localhost check is refused.
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD ["sh", "-c", "wget -q -t 1 --spider http://127.0.0.1:8080/ || exit 1"]
