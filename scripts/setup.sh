#!/bin/bash

# Hedera AI Basket System Setup Script
# This script sets up the development environment

set -e

echo "🚀 Setting up Hedera AI Basket System..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    # Check forge (Foundry)
    if ! command -v forge &> /dev/null; then
        print_error "Foundry is not installed. Please install Foundry first."
        print_warning "Install with: curl -L https://foundry.paradigm.xyz | bash"
        exit 1
    fi
    
    # Check PostgreSQL
    if ! command -v psql &> /dev/null; then
        print_error "PostgreSQL is not installed. Please install PostgreSQL first."
        exit 1
    fi
    
    # Check Redis
    if ! command -v redis-cli &> /dev/null; then
        print_error "Redis is not installed. Please install Redis first."
        exit 1
    fi
    
    print_status "All dependencies are installed ✅"
}

# Install root dependencies
install_root_dependencies() {
    print_status "Installing root dependencies..."
    npm install
}

# Install contract dependencies
install_contract_dependencies() {
    print_status "Installing contract dependencies..."
    cd contracts
    
    # Install Foundry dependencies
    forge install openzeppelin/openzeppelin-contracts --no-commit
    forge install pyth-network/pyth-sdk-solidity --no-commit
    
    cd ..
    print_status "Contract dependencies installed ✅"
}

# Install backend dependencies
install_backend_dependencies() {
    print_status "Installing backend dependencies..."
    cd backend
    npm install
    cd ..
    print_status "Backend dependencies installed ✅"
}

# Setup environment file
setup_environment() {
    print_status "Setting up environment configuration..."
    
    if [ ! -f .env ]; then
        cp env.example .env
        print_warning "Created .env file from template. Please update it with your credentials."
    else
        print_warning ".env file already exists. Please verify your configuration."
    fi
}

# Setup database
setup_database() {
    print_status "Setting up database..."
    
    # Check if database exists
    if psql -lqt | cut -d \| -f 1 | grep -qw hedera_basket_db; then
        print_warning "Database 'hedera_basket_db' already exists."
    else
        print_status "Creating database..."
        createdb hedera_basket_db
    fi
    
    # Run schema
    print_status "Running database schema..."
    psql hedera_basket_db < backend/src/database/schema.sql
    
    print_status "Database setup completed ✅"
}

# Build contracts
build_contracts() {
    print_status "Building smart contracts..."
    cd contracts
    forge build
    cd ..
    print_status "Smart contracts built ✅"
}

# Build backend
build_backend() {
    print_status "Building backend..."
    cd backend
    npm run build
    cd ..
    print_status "Backend built ✅"
}

# Verify services
verify_services() {
    print_status "Verifying services..."
    
    # Check PostgreSQL
    if pg_isready -q; then
        print_status "PostgreSQL is running ✅"
    else
        print_warning "PostgreSQL is not running. Please start it."
    fi
    
    # Check Redis
    if redis-cli ping > /dev/null 2>&1; then
        print_status "Redis is running ✅"
    else
        print_warning "Redis is not running. Please start it."
    fi
}

# Main setup function
main() {
    echo "🎯 Hedera AI Basket System Setup"
    echo "================================"
    
    check_dependencies
    install_root_dependencies
    install_contract_dependencies
    install_backend_dependencies
    setup_environment
    setup_database
    build_contracts
    build_backend
    verify_services
    
    echo ""
    echo "🎉 Setup completed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Update .env file with your API keys and credentials"
    echo "2. Deploy smart contracts: cd contracts && forge script script/DeployAndVerify.s.sol --rpc-url hedera-testnet --broadcast"
    echo "3. Start backend: cd backend && npm run dev"
    echo "4. Test the API: curl http://localhost:3000/api/health"
    echo ""
    echo "📚 Documentation: See README.md for detailed instructions"
}

# Run main function
main "$@"
