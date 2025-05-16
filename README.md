# Eyes Simulator

A simulator for eye pathologies and behaviors, with 2D, 2.5D, and 3D visualization modes.

## Docker Deployment Instructions

This project can be deployed using Docker Compose, making it easy to set up both development and production environments.

### Prerequisites

- Docker and Docker Compose installed on your system
- Git (to clone the repository)
- Access to an existing MongoDB instance (connection parameters in env_example)

### Setup Instructions

1. Clone the repository:

```bash
git clone https://github.com/yourusername/eyes-simulator.git
cd eyes-simulator
```

2. The application will use the connection parameters in the web-app/env_example file to connect to your MongoDB instance. Make sure these parameters are correct:

```
MONGODB_DATABASE=EyesSimulator
MONGODB_USER=admin
MONGODB_PASSWORD=XAgentDb123!
MONGODB_HOST=34.142.197.147  # Your external MongoDB host
MONGODB_PORT=27017
JWT_SECRET=krgN0q1e6yrrSicAQi6hGbwX7W9rfcDvT+SoRxBHR4o=
```

### Quick Deployment Using Script

A deployment script is provided for convenience. Make it executable and run:

```bash
chmod +x deploy.sh
./deploy.sh   # For production mode (default)
```

Options:
- `-p, --production`: Deploy in production mode (default)
- `-d, --development`: Deploy in development mode
- `-s, --stop`: Stop running containers
- `-b, --build`: Force rebuild images
- `-h, --help`: Show help information

Examples:
```bash
./deploy.sh --development  # Start in development mode
./deploy.sh --stop         # Stop all containers
./deploy.sh --build        # Force rebuild images
```

### Manual Deployment

#### Production Deployment

To start the application in production mode manually:

```bash
docker compose up -d
```

This will:
- Build and start the web application in production mode
- Make the application available at http://localhost:3000
- Connect to your external MongoDB instance using the parameters in env_example

#### Development Environment

To start the application in development mode with hot-reloading:

```bash
docker compose --profile dev up -d
```

This will:
- Build and start the web application in development mode
- Make the application available at http://localhost:3001
- Enable hot-reloading (changes to your code will be reflected immediately)
- Connect to your external MongoDB instance using the parameters in env_example

#### Stopping the Application

To stop the application:

```bash
docker compose down
```

Or for development mode:

```bash
docker compose --profile dev down
```

### Database Initialization

If you need to initialize the database with default values:

```bash
docker compose exec web-app yarn init-db
```

Or for development mode:

```bash
docker compose exec web-app-dev yarn init-db
```

## Manual Deployment

If you prefer to run the application without Docker:

1. Make sure you have access to your MongoDB instance
2. Navigate to the web-app directory:

```bash
cd web-app
```

3. Install dependencies:

```bash
yarn install
```

4. Copy env_example to .env:

```bash
cp env_example .env
```

5. Run the application in development mode:

```bash
yarn dev
```

Or build and run in production mode:

```bash
yarn build
yarn start
```

## Features

- Interactive eye simulation with various pathologies
- Multiple view modes (2D, 2.5D, and 3D)
- Customizable iris color, pupil size, and other parameters
- Simulation of eye movements and deviations
- Testing tools for optometry and ophthalmology education 