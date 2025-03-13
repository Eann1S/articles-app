FROM node:19 as builder

WORKDIR /app

COPY package*.json .

RUN npm install

COPY . .

RUN npm run build


FROM node:19-alpine as runner

WORKDIR /app

COPY --from=builder /app/dist ./dist

COPY --from=builder /app/package.json .

COPY --from=builder /app/package-lock.json .

COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

CMD ["node", "dist/main"]