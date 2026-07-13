FROM node:26-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
RUN npm run build
# The nginx config is rendered from its template with the booking URL taken
# from src/lib/site-config.json — the same single source the site imports.
RUN node docker/render-nginx-conf.mjs build-docker/default.conf

# Static site: serve the prerendered output with an unprivileged nginx.
FROM nginxinc/nginx-unprivileged:1-alpine
COPY --from=build /app/build-docker/default.conf /etc/nginx/conf.d/default.conf
COPY docker/security-headers.conf /etc/nginx/snippets/security-headers.conf
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -t 1 --spider http://localhost:8080/ || exit 1
