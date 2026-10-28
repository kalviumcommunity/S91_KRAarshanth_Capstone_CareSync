FROM node:20-alpine

ENV NODE_ENV=production \
    PORT=5000 \
    UPLOAD_DIR=/app/server/uploads

WORKDIR /app

COPY package.json package-lock.json ./
COPY client/package.json ./client/package.json
COPY server/package.json ./server/package.json

RUN npm ci --omit=dev \
    && mkdir -p /app/server/uploads \
    && chown -R node:node /app

COPY --chown=node:node server/src ./server/src

USER node

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD node -e "fetch('http://127.0.0.1:5000/api/health').then((response) => process.exit(response.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["npm", "run", "start", "--workspace", "server"]
