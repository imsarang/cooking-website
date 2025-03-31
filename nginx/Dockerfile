FROM nginx:1.19.6-alpine AS production-stage

WORKDIR /usr/share/nginx/html

COPY nginx.conf /etc/nginx/nginx.conf
RUN ls -lah /etc/nginx/nginx.conf
RUN  if [ -f "/etc/nginx/nginx.conf" ]; then cat /etc/nginx/nginx.conf; else echo "Warning: 'nginx.conf' does not exist"; fi

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
