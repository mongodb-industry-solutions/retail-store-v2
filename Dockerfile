#############################
# 1️⃣ Build Stage
#############################
FROM node:20-alpine AS builder
WORKDIR /app

# Copiamos manifest primero para aprovechar la cache
COPY ./package*.json ./

# Instalamos dependencias de forma determinista
RUN npm ci --legacy-peer-deps

# Copiamos el código
COPY ./ ./

# 🔐 Env DUMMY para que Next.js no falle en el build
# (NINGUNO de estos valores es real, son placeholders)
ENV MONGODB_URI="placeholder" \
    DATABASE_NAME="" \
    COLLECTION_NAME=""
 ENV DATAWORKZ_SERVICE="" \
     DATAWORKZ_TOKEN="" \
     DATAWORKZ_AGENT_ID="" \
     DATAWORKZ_LLM_ID=""

RUN npm run build

#############################
# 2️⃣ Runtime Stage
#############################
FROM node:20-alpine
WORKDIR /app

# Copiamos solo lo necesario del builder
COPY --from=builder /app ./

# Puerto estándar en Kanopy
ENV PORT=8080
EXPOSE 8080

# En runtime, Kanopy sobrescribe las ENV con envSecrets
CMD ["npm", "start"]
