#!/bin/bash

# Google Auth Local Implementation Setup Script
# This script helps verify your Google Auth configuration

echo "============================================="
echo "Google Auth Local Implementation Checker"
echo "============================================="
echo ""

# Check environment variables
echo "📋 Checking environment variables..."
echo ""

check_env_var() {
  var_name=$1
  var_value=$(grep "^$var_name" .env | cut -d'=' -f2- | tr -d ' "')

  if [ -z "$var_value" ]; then
    echo "❌ $var_name is NOT set"
    return 1
  else
    # Don't print full value for security
    echo "✅ $var_name is set"
    return 0
  fi
}

# Check required variables
all_ok=true

if ! check_env_var "SUPABASE_URL"; then all_ok=false; fi
if ! check_env_var "SUPABASE_SERVICE_ROLE_KEY"; then all_ok=false; fi
if ! check_env_var "AUTH_SECRET"; then all_ok=false; fi

echo ""
echo "📋 Checking Google OAuth configuration..."
echo ""

google_enabled=$(grep "^NEXT_PUBLIC_AUTH_GOOGLE_ENABLED" .env | cut -d'=' -f2- | tr -d ' "')
onetap_enabled=$(grep "^NEXT_PUBLIC_AUTH_GOOGLE_ONE_TAP_ENABLED" .env | cut -d'=' -f2- | tr -d ' "')

if [ "$google_enabled" = "true" ]; then
  echo "✅ Google OAuth is ENABLED"
  if ! check_env_var "AUTH_GOOGLE_ID"; then all_ok=false; fi
  if ! check_env_var "AUTH_GOOGLE_SECRET"; then all_ok=false; fi
else
  echo "⚠️  Google OAuth is DISABLED (set NEXT_PUBLIC_AUTH_GOOGLE_ENABLED=true to enable)"
fi

if [ "$onetap_enabled" = "true" ]; then
  echo "✅ Google One Tap is ENABLED"
  if ! check_env_var "NEXT_PUBLIC_AUTH_GOOGLE_ID"; then all_ok=false; fi
else
  echo "⚠️  Google One Tap is DISABLED (set NEXT_PUBLIC_AUTH_GOOGLE_ONE_TAP_ENABLED=true to enable)"
fi

echo ""
echo "📁 Checking required files..."
echo ""

check_file() {
  if [ -f "$1" ]; then
    echo "✅ $1 exists"
    return 0
  else
    echo "❌ $1 is MISSING"
    return 1
  fi
}

check_file "auth/config.ts"
check_file "auth/index.ts"
check_file "app/api/auth/[...nextauth]/route.ts"
check_file "services/user.ts"
check_file "models/user.ts"
check_file "models/credit.ts"
check_file "models/db.ts"
check_file "data/install.sql"
check_file "hooks/useOneTapLogin.tsx"
check_file "components/auth/signin-form.tsx"

echo ""
echo "============================================="

if [ "$all_ok" = true ]; then
  echo "✅ All required configuration is complete!"
  echo ""
  echo "Next steps:"
  echo "1. Run 'pnpm dev' to start the development server"
  echo "2. Visit http://localhost:3006/auth/signin to test login"
  echo "3. Check server logs for detailed login process"
else
  echo "❌ Some configuration is missing!"
  echo ""
  echo "Please follow the setup guide:"
  echo "docs/GOOGLE_AUTH_LOCAL_IMPLEMENTATION.md"
fi

echo "============================================="
