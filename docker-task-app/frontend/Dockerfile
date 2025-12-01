# Frontend Dockerfile - Nginx serving static content

FROM nginx:alpine

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy static files
COPY public/ /usr/share/nginx/html/

# Expose port 80
EXPOSE 80

# Create non-root user for security
RUN addgroup -g 1001 -S nginx-user && \
    adduser -S nginx-user -u 1001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
