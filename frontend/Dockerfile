# Build stage
FROM node:18 
WORKDIR /app
COPY package*.json ./
# RUN ls -ltr /app  

RUN if [ -f "package.json" ]; then npm install; else echo "Error:Cannot download dependencies"; fi
COPY . .
RUN npm run build || (echo "Build failed" && exit 1) 

RUN mkdir -p /frontend_build && if [ -d "out" ]; then cp -r ./out/* /frontend_build/; else echo "Warning: 'out/' does not exist"; fi
# RUN ls -ltr /frontend_build

# EXPOSE 3000
# 
# CMD ["npm", "start"]