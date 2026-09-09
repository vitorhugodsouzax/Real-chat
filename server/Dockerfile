FROM node:20-alpine
WORKDIR /app
COPY package.json ./
COPY server/package.json server/package.json
RUN npm install --workspace=server
COPY server server
RUN npm run build --workspace=server
EXPOSE 3000
CMD ["sh", "-c", "npm run db:migrate --workspace=server && npm run start --workspace=server"]
