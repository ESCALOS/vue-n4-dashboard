# syntax=docker/dockerfile:1.7
# ── Etapa 1: compilar Caddy con el plugin Coraza ──────────────────────────────
FROM caddy:2-builder AS builder

RUN xcaddy build \
    --with github.com/corazawaf/coraza-caddy/v2

# ── Etapa 2: imagen final mínima ──────────────────────────────────────────────
FROM caddy:2-alpine

# Reemplazar binario por el compilado con Coraza
COPY --from=builder /usr/bin/caddy /usr/bin/caddy

# Directorios de trabajo
RUN mkdir -p /etc/caddy/certs \
             /etc/caddy/waf \
             /var/log/caddy

EXPOSE 8060
