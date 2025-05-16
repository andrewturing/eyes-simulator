#!/bin/bash

# Display help information
show_help() {
    echo "Eyes Simulator Deployment Script"
    echo ""
    echo "Usage: ./deploy.sh [options]"
    echo ""
    echo "Options:"
    echo "  -p, --production    Deploy in production mode (default)"
    echo "  -d, --development   Deploy in development mode"
    echo "  -s, --stop          Stop running containers"
    echo "  -b, --build         Force rebuild images"
    echo "  -h, --help          Show this help message"
    echo ""
}

# Default options
MODE="production"
STOP=false
BUILD=""

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case "$1" in
        -p|--production)
            MODE="production"
            shift
            ;;
        -d|--development)
            MODE="development"
            shift
            ;;
        -s|--stop)
            STOP=true
            shift
            ;;
        -b|--build)
            BUILD="--build"
            shift
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Stop containers if requested
if [ "$STOP" = true ]; then
    echo "Stopping containers..."
    if [ "$MODE" = "development" ]; then
        docker compose --profile dev down
    else
        docker compose down
    fi
    echo "Containers stopped successfully."
    exit 0
fi

# Load environment variables from env_example file
echo "Loading environment variables from env_example..."
if [ -f "web-app/env_example" ]; then
    # Create a temporary .env file from env_example for docker-compose
    cp web-app/env_example .env
    # Export these variables for docker-compose to use
    export $(grep -v '^#' web-app/env_example | xargs)
    echo "Environment variables loaded successfully."
else
    echo "Warning: env_example file not found in web-app directory."
fi

# Deploy based on chosen mode
if [ "$MODE" = "development" ]; then
    echo "Starting in DEVELOPMENT mode..."
    docker compose --profile dev up -d $BUILD
    echo "Development environment started on http://localhost:3001"
else
    echo "Starting in PRODUCTION mode..."
    docker compose up -d $BUILD
    echo "Production environment started on http://localhost:3000"
fi

echo ""
echo "MongoDB connection:"
echo "  Host: $(grep MONGODB_HOST web-app/env_example | cut -d= -f2)"
echo "  Database: $(grep MONGODB_DATABASE web-app/env_example | cut -d= -f2)"
echo ""
echo "To view logs:"
if [ "$MODE" = "development" ]; then
    echo "  docker compose --profile dev logs -f web-app-dev"
else
    echo "  docker compose logs -f web-app"
fi 