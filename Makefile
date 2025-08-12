.PHONY: help dev build test clean docker-dev docker-prod seed

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

dev: ## Start development environment
	@echo "🚀 Starting development environment..."
	npm run docker:dev

build: ## Build all services
	@echo "🔨 Building all services..."
	npm run build

test: ## Run all tests
	@echo "🧪 Running tests..."
	npm run test

clean: ## Clean up containers and volumes
	@echo "🧹 Cleaning up..."
	docker-compose -f docker-compose.dev.yml down -v
	docker-compose down -v

docker-dev: ## Start development with Docker
	@echo "🐳 Starting development containers..."
	docker-compose -f docker-compose.dev.yml up --build

docker-prod: ## Start production with Docker
	@echo "🐳 Starting production containers..."
	docker-compose up --build -d

seed: ## Seed database with sample data
	@echo "🌱 Seeding database..."
	npm run seed

logs: ## View logs from all services
	docker-compose -f docker-compose.dev.yml logs -f

stop: ## Stop all services
	@echo "⏹️ Stopping services..."
	docker-compose -f docker-compose.dev.yml down
	docker-compose down

restart: ## Restart all services
	@echo "🔄 Restarting services..."
	make stop
	make dev

setup: ## Initial setup for development
	@echo "⚙️ Setting up development environment..."
	cp .env.example .env
	@echo "✅ Environment file created. Please update .env with your configuration."
	@echo "📝 Run 'make dev' to start the development environment."
	@echo "🌱 Run 'make seed' after services are up to populate sample data."
