FROM node:20-alpine AS build
WORKDIR /app
COPY package.json ./
COPY client/package.json client/package.json
RUN npm install --workspace=client
COPY client client
RUN npm run build --workspace=client

FROM node:20-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=build /app/client/dist ./dist
EXPOSE 4173
CMD ["serve", "-s", "dist", "-l", "4173"]
