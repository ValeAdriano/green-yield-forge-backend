#!/bin/bash
# Script para buildar e fazer push das imagens para Docker Hub
# Uso: ./docker-push.sh [seu-usuario-dockerhub]

DOCKER_USER=${1:-adrianovale}
VERSION=${2:-1.0.0}

echo "🔐 Fazendo login no Docker Hub..."
docker login -u $DOCKER_USER

echo ""
echo "📦 Buildando e fazendo push das imagens..."

# BFF
echo "Building BFF..."
docker build -t $DOCKER_USER/pjbl-bff:$VERSION \
  -t $DOCKER_USER/pjbl-bff:latest \
  --build-arg SERVICE_PATH=services/bff \
  --build-arg START_CMD="node dist/index.js" \
  --build-arg HAS_BUILD=true \
  .

echo "Pushing BFF..."
docker push $DOCKER_USER/pjbl-bff:$VERSION
docker push $DOCKER_USER/pjbl-bff:latest

# ms-orders
echo "Building ms-orders..."
docker build -t $DOCKER_USER/pjbl-orders:$VERSION \
  -t $DOCKER_USER/pjbl-orders:latest \
  --build-arg SERVICE_PATH=services/ms-orders \
  --build-arg START_CMD="node dist/index.js" \
  --build-arg HAS_BUILD=true \
  .

echo "Pushing ms-orders..."
docker push $DOCKER_USER/pjbl-orders:$VERSION
docker push $DOCKER_USER/pjbl-orders:latest

# ms-projects
echo "Building ms-projects..."
docker build -t $DOCKER_USER/pjbl-projects:$VERSION \
  -t $DOCKER_USER/pjbl-projects:latest \
  --build-arg SERVICE_PATH=services/ms-projects \
  --build-arg START_CMD="node dist/index.js" \
  --build-arg HAS_BUILD=true \
  .

echo "Pushing ms-projects..."
docker push $DOCKER_USER/pjbl-projects:$VERSION
docker push $DOCKER_USER/pjbl-projects:latest

echo ""
echo "✅ Todas as imagens foram publicadas com sucesso!"
echo "📋 Imagens disponíveis:"
echo "   - $DOCKER_USER/pjbl-bff:$VERSION"
echo "   - $DOCKER_USER/pjbl-orders:$VERSION"
echo "   - $DOCKER_USER/pjbl-projects:$VERSION"

