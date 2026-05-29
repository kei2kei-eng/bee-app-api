FROM node:22-alpine
LABEL "language"="nodejs"
LABEL "framework"="express"

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

EXPOSE 3001
CMD ["npm", "start"]
   
