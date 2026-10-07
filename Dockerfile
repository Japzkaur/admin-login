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