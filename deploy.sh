#!/usr/bin/env bash
# =============================================================================
#  deploy.sh — Despliegue WAF Coraza + Caddy
#  Ejecutar desde la raíz del proyecto: bash deploy.sh
# =============================================================================
set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
ok()   { echo -e "${GREEN}✔ $*${NC}"; }
warn() { echo -e "${YELLOW}⚠ $*${NC}"; }
fail() { echo -e "${RED}✘ $*${NC}"; exit 1; }

echo ""
echo "═══════════════════════════════════════════"
echo "  Deploy: Caddy + Coraza WAF"
echo "  Host:   10.20.3.102"
echo "  Puerto: 8060 HTTPS"
echo "═══════════════════════════════════════════"
echo ""

# ── 1. Verificar certificados ─────────────────────────────────────────────────
echo "→ Verificando certificados..."

[[ -f caddy/certs/amagi.crt ]] || fail "Falta caddy/certs/amagi.crt"
[[ -f caddy/certs/amagi.key ]] || fail "Falta caddy/certs/amagi.key"
ok "Certificados presentes"

# Verificar que cert y key coinciden
CERT_MOD=$(openssl x509 -noout -modulus -in caddy/certs/amagi.crt 2>/dev/null | md5sum)
KEY_MOD=$(openssl rsa  -noout -modulus -in caddy/certs/amagi.key  2>/dev/null | md5sum)
[[ "$CERT_MOD" == "$KEY_MOD" ]] || fail "El .crt y el .key NO coinciden — verifica los archivos"
ok "Certificado y clave coinciden"

# Mostrar vigencia del certificado
EXPIRY=$(openssl x509 -noout -enddate -in caddy/certs/amagi.crt | cut -d= -f2)
warn "Certificado vence: $EXPIRY"

# Si hay CA bundle, combinarlo con el cert en un fullchain para Caddy
if [[ -f caddy/certs/amagi-ca.crt ]]; then
    cat caddy/certs/amagi.crt caddy/certs/amagi-ca.crt > caddy/certs/amagi-fullchain.crt
    ok "CA bundle detectado → fullchain generado en caddy/certs/amagi-fullchain.crt"
    warn "Actualiza Caddyfile: tls /etc/caddy/certs/amagi-fullchain.crt /etc/caddy/certs/amagi.key"
fi

# ── 2. Verificar conectividad al backend NestJS ───────────────────────────────
echo ""
echo "→ Verificando acceso a NestJS en 10.20.13.13..."
if curl -sf --connect-timeout 3 http://10.20.13.13/ > /dev/null 2>&1; then
    ok "NestJS accesible en 10.20.13.13"
else
    warn "No se puede alcanzar 10.20.13.13 (puede ser normal si solo responde a rutas específicas)"
fi

# ── 3. Build ──────────────────────────────────────────────────────────────────
echo ""
echo "→ Construyendo imágenes..."
docker compose build --no-cache
ok "Build completado"

# ── 4. Levantar ───────────────────────────────────────────────────────────────
echo ""
echo "→ Levantando servicios..."
docker compose up -d
sleep 5   # Dar tiempo a que Caddy inicialice Coraza + CRS

ok "Servicios levantados"
docker compose ps

# ── 5. Verificaciones rápidas ─────────────────────────────────────────────────
echo ""
echo "→ Verificaciones de humo..."

BASE="https://amagi.pdparacas.com.pe:8060"

# 5a. Frontend responde
HTTP_CODE=$(curl -sk -o /dev/null -w "%{http_code}" "${BASE}/")
if [[ "$HTTP_CODE" == "200" ]]; then
    ok "Frontend Vue responde: HTTP $HTTP_CODE"
else
    warn "Frontend: HTTP $HTTP_CODE (revisar logs)"
fi

# 5b. WAF bloquea SQLi básico
BLOCK_CODE=$(curl -sk -o /dev/null -w "%{http_code}" \
    "${BASE}/?id=1%20OR%201%3D1--")
if [[ "$BLOCK_CODE" == "403" ]]; then
    ok "WAF bloquea SQLi: HTTP $BLOCK_CODE ✔"
else
    warn "WAF no bloqueó SQLi (HTTP $BLOCK_CODE) — revisar SecRuleEngine en coraza-tuning.conf"
fi

# 5c. WAF bloquea XSS básico
XSS_CODE=$(curl -sk -o /dev/null -w "%{http_code}" \
    "${BASE}/?q=%3Cscript%3Ealert(1)%3C%2Fscript%3E")
if [[ "$XSS_CODE" == "403" ]]; then
    ok "WAF bloquea XSS:  HTTP $XSS_CODE ✔"
else
    warn "WAF no bloqueó XSS (HTTP $XSS_CODE)"
fi

echo ""
echo "═══════════════════════════════════════════"
echo "  Logs en tiempo real:"
echo "  docker compose logs -f caddy"
echo ""
echo "  Logs de auditoría WAF:"
echo "  docker compose exec caddy tail -f /var/log/caddy/access.log | jq ."
echo "═══════════════════════════════════════════"
echo ""
