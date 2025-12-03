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
ENV MONGODB_URI="mongodb://placeholder" \
    DATABASE_NAME="placeholder" \
    COLLECTION_NAME="placeholder" \
    DATAWORKZ_SERVICE="https://placeholder" \
    DATAWORKZ_TOKEN="placeholder" \
    DATAWORKZ_AGENT_ID="placeholder" \
    DATAWORKZ_LLM_ID="placeholder"


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
