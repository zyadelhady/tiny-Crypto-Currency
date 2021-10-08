FROM node:lts-alpine as client-builder
WORKDIR '/client'
COPY ./client/package.json ./
RUN npm install 
COPY ./client ./
RUN npm run build

FROM node:lts-alpine
EXPOSE 3000 3001
WORKDIR '/server'
COPY ./server/package.json ./
RUN npm install
COPY ./server ./
RUN npm run build  
COPY --from=client-builder /client/build ./build
CMD ["npm","run","start"]     
