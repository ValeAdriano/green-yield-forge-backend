#!/bin/bash
# Script para buildar e fazer push das imagens Docker para o Docker Hub
# Uso: ./build-and-push.sh <seu-usuario-dockerhub> [tag]

set -e

DOCKER_HUB_USER=$1
TAG=${2:-latest}

if [ -z "$DOCKER_HUB_USER" ]; then
    echo "Erro: É necessário fornecer o usuário do Docker Hub"
    echo "Uso: ./build-and-push.sh <seu-usuario-dockerhub> [tag]"
    exit 1
fi

echo "=== Buildando e fazendo push das imagens Docker ==="

# Define os serviços
declare -a services=(
    "bff:services/bff"
    "ms-projects:services/ms-projects"
    "ms-orders:services/ms-orders"
)

for service in "${services[@]}"; do
    IFS=':' read -r name path <<< "$service"
    
    echo ""
    echo "=== Buildando $name ==="
    
    # Build da imagem
    docker build -t "$DOCKER_HUB_USER/$name:$TAG" "$path"
    
    if [ $? -eq 0 ]; then
        echo "✓ Build concluído: $DOCKER_HUB_USER/$name:$TAG"
        
        # Push da imagem
        echo "Fazendo push de $DOCKER_HUB_USER/$name:$TAG..."
        docker push "$DOCKER_HUB_USER/$name:$TAG"
        
        if [ $? -eq 0 ]; then
            echo "✓ Push concluído: $DOCKER_HUB_USER/$name:$TAG"
        else
            echo "✗ Erro ao fazer push: $DOCKER_HUB_USER/$name:$TAG"
        fi
    else
        echo "✗ Erro ao buildar: $DOCKER_HUB_USER/$name:$TAG"
    fi
done

echo ""
echo "=== Processo concluído ==="

