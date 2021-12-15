#!/bin/bash

# Create a new namespace
kubectl create namespace osuclassy-dev

# Database creation
echo "Deploying database..."
kubectl apply -f k8s_configurations/db-secret.yaml
kubectl apply -f k8s_configurations/db-pv.yaml
kubectl apply -f k8s_configurations/db-configmap.yaml
kubectl apply -f k8s_configurations/db-deployment.yaml

echo "Deploying the backend..."
kubectl apply -f k8s_configurations/backend-deployment.yaml

echo "Creating ingress..."
kubectl apply -f k8s_configurations/osuclassy-ingress.yaml

echo "Finished!"