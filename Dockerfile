<<<<<<< HEAD
# Stage 1: Build React static bundle
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# Stage 2: Serve using NGINX Alpine on Port 8080
FROM nginx:alpine
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
=======
# Stage 1: Build the React / Vite application
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve using Official Apache HTTP Server
FROM httpd:alpine

# Copy built production files into Apache document root
COPY --from=builder /app/dist/ /usr/local/apache2/htdocs/

# Configure Apache: enable mod_rewrite & allow .htaccess for React routing
RUN sed -i '/LoadModule rewrite_module/s/^#//g' /usr/local/apache2/conf/httpd.conf && \
    sed -i 's#AllowOverride None#AllowOverride All#g' /usr/local/apache2/conf/httpd.conf

# Add rewrite rules for React Single Page Application
RUN echo '<Directory "/usr/local/apache2/htdocs">' >> /usr/local/apache2/conf/httpd.conf && \
    echo '    RewriteEngine On' >> /usr/local/apache2/conf/httpd.conf && \
    echo '    RewriteBase /' >> /usr/local/apache2/conf/httpd.conf && \
    echo '    RewriteRule ^index\.html$ - [L]' >> /usr/local/apache2/conf/httpd.conf && \
    echo '    RewriteCond %{REQUEST_FILENAME} !-f' >> /usr/local/apache2/conf/httpd.conf && \
    echo '    RewriteCond %{REQUEST_FILENAME} !-d' >> /usr/local/apache2/conf/httpd.conf && \
    echo '    RewriteRule . /index.html [L]' >> /usr/local/apache2/conf/httpd.conf && \
    echo '</Directory>' >> /usr/local/apache2/conf/httpd.conf

EXPOSE 80
CMD ["httpd-foreground"]
>>>>>>> 172398337f1a24c76f17ee7996fb818eb5781fed
