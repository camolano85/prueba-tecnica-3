# Ruleta de Apuestas – API (Node.js + Express)

Este repositorio contiene una API que simula una ruleta de apuestas. La API modela estados (abierta/cerrada), valida reglas de negocio y calcula pagos al cerrar la ruleta. No utiliza base de datos; los datos se mantienen en memoria.

## Contenido
- [Requisitos](#requisitos)
- [Instalación](#instalación)
- [Ejecución](#ejecución)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Endpoints](#endpoints)
- [Ejemplos con cURL](#ejemplos-con-curl)
- [Postman](#postman)
- [Pruebas automatizadas](#pruebas-automatizadas)
- [Decisiones de diseño](#decisiones-de-diseño)
- [Posibles extensiones](#posibles-extensiones)
- [Licencia](#licencia)

## Requisitos
- Node.js 18 o superior
- npm

## Instalación
```bash
git clone <URL_DE_TU_REPO>
cd ruleta-api
npm install
```

## Ejecución
```bash
npm run dev     

npm start      
```
La API se inicia por defecto en `http://localhost:4000`.

## Estructura del proyecto
```
ruleta-api/
├─ src/
│  ├─ server.js
│  ├─ routes/
│  │  └─ roulettes.routes.js
│  └─ services/
│     └─ roulette.service.js
├─ package.json
└─ README.md
```

## Endpoints

Base URL: `http://localhost:4000/api/roulettes`

| Método | Ruta                         | Descripción                                   | Códigos relevantes                  |
|-------:|------------------------------|-----------------------------------------------|-------------------------------------|
|  POST  | `/`                          | Crea una ruleta y devuelve su `id`.           | 201                                  |
|   GET  | `/`                          | Lista ruletas con su estado actual.           | 200                                  |
| PATCH  | `/:id/open`                  | Abre una ruleta para aceptar apuestas.        | 200, 404 (no existe)                 |
|  POST  | `/:id/bets`                  | Registra apuesta a número o color.            | 201, 400 (validación), 409 (cerrada) |
| PATCH  | `/:id/close`                 | Cierra ruleta, genera ganador y calcula pagos.| 200, 404, 409                        |

### Reglas de negocio
- La ruleta solo acepta apuestas cuando está abierta.
- Apuestas válidas:
  - A un número entre 0 y 36.
  - A un color: `rojo` o `negro` (también se aceptan `red` y `black`, pero se normalizan a español).
- Monto (`amount`) entre 1 y 10.000.
- Pagos al cerrar:
  - Número exacto: 5.0 × monto.
  - Color correcto: 1.8 × monto.
  - Resto: pierde (0).
- Determinación de color: números pares son `rojo` e impares `negro` (según el enunciado de la prueba).

## Ejemplos con cURL

Base para reutilizar:
```bash
BASE=http://localhost:4000/api/roulettes
```

Crear ruleta:
```bash
RID=$(curl -sX POST $BASE | jq -r '.id'); echo $RID
```

Abrir ruleta:
```bash
curl -sX PATCH $BASE/$RID/open | jq
```

Apostar a número (ej. 18 por 2500):
```bash
curl -sX POST $BASE/$RID/bets \
  -H "Content-Type: application/json" \
  -d '{"amount": 2500, "number": 18}' | jq
```

Apostar a color (ej. negro por 1000):
```bash
curl -sX POST $BASE/$RID/bets \
  -H "Content-Type: application/json" \
  -d '{"amount": 1000, "color": "negro"}' | jq
```

Cerrar ruleta:
```bash
curl -sX PATCH $BASE/$RID/close | jq
```

Listar ruletas:
```bash
curl -s $BASE | jq
```

## Postman

Se incluye una colección lista para importar con todos los endpoints y variables de entorno (`baseUrl` y `RID`).

1. Importar la colección:
   - Archivo: `ruleta_postman_collection.json`
2. Seleccionar o crear un Environment (por ejemplo, `Ruleta env`) con:
   - `baseUrl` = `http://localhost:4000`
   - `RID` vacío (se llenará automáticamente)
3. En el request “Crear ruleta” está configurado un test que guarda el `RID` automáticamente:
   ```javascript
   pm.test('Status 201', function () {
     pm.response.to.have.status(201);
   });
   pm.environment.set('RID', pm.response.json().id);
   ```
4. Ejecutar en este orden: Crear → Abrir → (Apostar número/color) → Cerrar → Listar.


