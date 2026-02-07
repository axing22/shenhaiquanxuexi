#!/bin/bash

# Google Auth End-to-End Test Script
# This script helps you test the Google authentication flow

echo "============================================="
echo "Google Auth E2E Test Guide"
echo "============================================="
echo ""

echo "This script will guide you through testing the Google authentication implementation."
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_step() {
  echo -e "${GREEN}[STEP $1]${NC} $2"
}

print_check() {
  echo -e "${YELLOW}[CHECK]${NC} $1"
}

print_error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

# Step 1: Environment Check
print_step 1 "Checking environment configuration"
echo ""

if [ ! -f ".env" ]; then
  print_error ".env file not found!"
  exit 1
fi

# Check critical env vars
has_supabase=$(grep -c "^SUPABASE_URL.*=" .env)
has_google=$(grep -c "^AUTH_GOOGLE_ID.*=" .env)
google_enabled=$(grep "^NEXT_PUBLIC_AUTH_GOOGLE_ENABLED" .env | grep -c "true")

if [ "$has_supabase" -eq 0 ]; then
  print_error "SUPABASE_URL not configured in .env"
  exit 1
fi

if [ "$has_google" -eq 0 ]; then
  print_error "AUTH_GOOGLE_ID not configured in .env"
  exit 1
fi

if [ "$google_enabled" -eq 0 ]; then
  echo "⚠️  Google OAuth is disabled"
  echo "Set NEXT_PUBLIC_AUTH_GOOGLE_ENABLED=true in .env to enable"
  echo ""
fi

echo "✅ Environment configuration looks good"
echo ""

# Step 2: Database Check
print_step 2 "Database setup verification"
echo ""

print_check "Please verify in Supabase Dashboard:"
echo "  1. Open Supabase Dashboard: https://supabase.com/dashboard"
echo "  2. Navigate to SQL Editor"
echo "  3. Verify these tables exist:"
echo "     - users"
echo "     - credits"
echo "     - credit_history"
echo "     - orders"
echo ""

read -p "Have you verified the tables exist? (y/n): " db_verified

if [ "$db_verified" != "y" ]; then
  print_error "Please create tables using data/install.sql first"
  echo "Run this SQL in Supabase SQL Editor:"
  echo "cat data/install.sql"
  exit 1
fi

echo "✅ Database verification complete"
echo ""

# Step 3: Server Start
print_step 3 "Starting development server"
echo ""

echo "Starting server with: pnpm dev"
echo "Press Ctrl+C to stop the server when testing is complete"
echo ""
echo "Server should start on: http://localhost:3006"
echo ""

read -p "Press Enter to start the server, or Ctrl+C to exit..."
echo ""

# Start server (this will block)
pnpm dev &
SERVER_PID=$!

# Give server time to start
sleep 5

# Step 4: Testing Guide
print_step 4 "Testing Google Authentication"
echo ""

echo "📋 Test Checklist:"
echo ""
echo "1. Open browser and navigate to:"
echo "   http://localhost:3006/auth/signin"
echo ""
echo "2. Standard OAuth Login Test:"
echo "   - Click 'Sign in with Google' button"
echo "   - Complete Google authorization"
echo "   - Verify redirect back to application"
echo "   - Check if user is logged in"
echo ""
echo "3. One Tap Login Test:"
echo "   - Sign out if logged in"
echo "   - Refresh the page"
echo "   - Look for Google One Tap popup (top-right)"
echo "   - Click your account to login"
echo ""
echo "4. Server Logs Check:"
echo "   - Look for these log messages:"
echo "     [NextAuth JWT] Processing login for: ..."
echo "     [saveUser] User inserted with UUID: ..."
echo "     [NextAuth JWT] User saved successfully: ..."
echo ""
echo "5. Database Verification:"
echo "   - Open Supabase Dashboard"
echo "   - Check 'users' table for new user"
echo "   - Check 'credits' table (balance should be 10)"
echo "   - Check 'credit_history' table (type: 'new_user', amount: 10)"
echo ""
echo "6. Session Verification:"
echo "   - Open browser DevTools (F12)"
echo "   - Go to Console tab"
echo "   - Type: window.next auth?.getSession()"
echo "   - Verify user data is returned"
echo ""

read -p "Press Enter after completing all tests..."

# Cleanup
echo ""
print_step 5 "Cleanup"
echo ""

echo "Stopping development server..."
kill $SERVER_PID 2>/dev/null

echo ""
echo "============================================="
echo "Test Complete!"
echo "============================================="
echo ""
echo "If all tests passed, your Google Auth is working correctly!"
echo ""
echo "For troubleshooting, check:"
echo "- docs/GOOGLE_AUTH_LOCAL_IMPLEMENTATION.md"
echo "- Server logs for error messages"
echo "- Browser console for client-side errors"
