# Frontend N4 Dashboard (Producción con Docker + Nginx)

Este frontend quedó preparado para producción con:

- Un servicio `frontend` (SPA Vue compilada) escuchando en puerto interno `8080`.
- Un servicio `nginx` como proxy inverso exponiendo el puerto `80`.
- Posibilidad de escalar `frontend` horizontalmente.

## Archivos agregados

- [Dockerfile.frontend](Dockerfile.frontend)
- [docker-compose.prod.yml](docker-compose.prod.yml)
- [nginx/frontend.conf](nginx/frontend.conf)
- [nginx/reverse-proxy.conf.template](nginx/reverse-proxy.conf.template)
- [.dockerignore](.dockerignore)

## Levantar en producción

Desde [vue-n4-dashboard](.):

1. Construir y levantar:
	- `docker compose -f docker-compose.prod.yml up -d --build`
2. Acceder:
	- `http://localhost` (sale por Nginx en puerto 80)

Si tu backend no está en `http://host.docker.internal:3000`, define antes:

- `BACKEND_UPSTREAM=http://tu-backend:3000`

## Escalado horizontal del frontend

Puedes correr múltiples instancias del servicio `frontend`:

- `docker compose -f docker-compose.prod.yml up -d --build --scale frontend=3`

Nginx balancea las peticiones entre réplicas del upstream `frontend`.

## Notas

- El proxy externo escucha en `80`.
- El frontend real no se publica al host; solo expone `8080` internamente.
- Las llamadas a `/api` se enrutan al backend y se elimina el prefijo `/api` (igual que en Vite dev).
- Si quieres TLS (443), se puede extender el proxy con certificados (Let's Encrypt o similar).
