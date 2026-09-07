# MiFantasy (nombre provisional)

Clon "a tu estilo" de un juego de fantasy de fútbol, pensado para que lo desarrolles tú en VS Code. Incluye backend (API + base de datos) y frontend (web app) separados.

## Stack

- **Backend:** Node.js + TypeScript + Express + Prisma ORM + PostgreSQL
- **Frontend:** React + Vite + TypeScript + Tailwind CSS
- **Datos de jugadores reales (opcional):** una API de fútbol (ver sección "Datos" abajo)

Puedes cambiar cualquiera de estas piezas — es solo una base razonable para empezar rápido en VS Code (extensiones recomendadas: Prisma, ESLint, Tailwind CSS IntelliSense).

## Estructura

```
fantasy-app/
  backend/
    prisma/schema.prisma   # Modelos de datos
    src/
      index.ts             # Servidor Express
      db.ts                # Cliente Prisma
      routes/               # Endpoints REST
      services/scoring.ts  # Lógica de puntuación fantasy
  frontend/
    src/
      pages/                # Dashboard, armar equipo, liga
      components/
      lib/api.ts            # Cliente HTTP hacia el backend
```

## Cómo arrancar

### Backend
```bash
cd backend
npm install
cp .env.example .env   # configura tu DATABASE_URL de Postgres
npx prisma migrate dev --name init
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Mecánicas centrales (genéricas, no protegidas por copyright)

Los mecanismos de un fantasy deportivo (presupuesto, formación, transferencias, puntos por goles/asistencias/porterías a cero, jornadas) son reglas de juego, no obra protegida — decenas de plataformas los usan (Fantasy Premier League, Kickbase, Fantasy LaLiga, Sorare...). Lo que SÍ debes evitar reproducir es:

- Nombres de marca ("LaLiga Fantasy", "LaLiga"), logos y escudos oficiales de clubes, tipografías/branding oficial.
- Fotos oficiales de jugadores con derechos reservados (usa iniciales/avatares genéricos o ilustraciones propias).
- Interfaz y assets visuales calcados pixel a pixel.

Los **nombres de jugadores reales y sus estadísticas** (goles, minutos, tarjetas) son hechos públicos y generalmente se pueden usar; los **logos de clubes y competiciones** son marcas registradas — para tu propio proyecto personal el riesgo es bajo, pero si algún día lo publicas/monetizas, usa nombres de clubes ficticios o pide licencia. Cuando quieras, retomamos esto a fondo.

## Roadmap sugerido

1. Modelos base (jugadores, clubes, jornadas) + seed de datos de prueba
2. Armar plantilla con presupuesto y formación
3. Cálculo de puntos por jornada
4. Ligas privadas entre amigos + clasificación
5. Mercado de fichajes / transferencias
6. Ingesta automática de estadísticas reales (API de fútbol) para actualizar puntos
7. Autenticación de usuarios
