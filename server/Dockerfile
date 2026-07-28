FROM node:24-alpine

# Install FFmpeg & Tesseract dependencies
RUN apk add --no-cache ffmpeg tesseract-ocr tesseract-ocr-data-eng tesseract-ocr-data-tel

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["node", "src/server.js"]
