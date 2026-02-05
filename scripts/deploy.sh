#!/bin/bash

# Check if site and command parameters are provided
if [ -z "$1" ] || [ -z "$2" ]; then
  echo "Usage: $0 <site> <command> [aws_profile]"
  exit 1
fi

site=$1
command=$2
aws_profile=$3

# Define environment variables for each site
case $site in
  staging)
    NEXT_PUBLIC_DEFAULT_NETWORK=testnet
    NEXT_PUBLIC_HATHOR_NODE_URL_TESTNET=https://node1.india.testnet.hathor.network/v1a
    NEXT_PUBLIC_HATHOR_NODE_URL_MAINNET=https://node1.mainnet.hathor.network/v1a
    NEXT_PUBLIC_CONTRACT_IDS='["00000000361ec0406d90a5bb4c6c7330af5792178b86cfc353afd4e50a62b741", "00000000b275d12824faa41177c7087fbc516b6d1811f780291036056d2cf1b3"]'
    NEXT_PUBLIC_USE_MOCK_WALLET=false
    NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=8264fff563181da658ce64ee80e80458
    S3_BUCKET=hathor-dice-staging
    CLOUDFRONT_ID=E1TZZUU0BQC4B5
    ;;
  production)
    NEXT_PUBLIC_DEFAULT_NETWORK=mainnet
    NEXT_PUBLIC_HATHOR_NODE_URL_TESTNET=https://node1.india.testnet.hathor.network/v1a
    NEXT_PUBLIC_HATHOR_NODE_URL_MAINNET=https://node1.mainnet.hathor.network/v1a
    NEXT_PUBLIC_CONTRACT_IDS='["0000000079862340c1f7822b81f58668e2a62c5f1b69d8d2e3b8fdf1855196c1"]'
    NEXT_PUBLIC_USE_MOCK_WALLET=false
    NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=8264fff563181da658ce64ee80e80458
    S3_BUCKET=hathor-dice-production
    CLOUDFRONT_ID=E12SHKOWBW5QA4
    ;;
  *)
    echo "Unknown site: $site"
    exit 1
    ;;
esac

export NEXT_PUBLIC_DEFAULT_NETWORK
export NEXT_PUBLIC_HATHOR_NODE_URL_TESTNET
export NEXT_PUBLIC_HATHOR_NODE_URL_MAINNET
export NEXT_PUBLIC_CONTRACT_IDS
export NEXT_PUBLIC_USE_MOCK_WALLET
export NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
export S3_BUCKET
export CLOUDFRONT_ID

case $command in
  build)
    echo "Building for site: $site"
    echo "NEXT_PUBLIC_DEFAULT_NETWORK: $NEXT_PUBLIC_DEFAULT_NETWORK"
    echo "NEXT_PUBLIC_HATHOR_NODE_URL_TESTNET: $NEXT_PUBLIC_HATHOR_NODE_URL_TESTNET"
    echo "NEXT_PUBLIC_HATHOR_NODE_URL_MAINNET: $NEXT_PUBLIC_HATHOR_NODE_URL_MAINNET"
    echo "NEXT_PUBLIC_CONTRACT_IDS: $NEXT_PUBLIC_CONTRACT_IDS"
    echo "NEXT_PUBLIC_USE_MOCK_WALLET: $NEXT_PUBLIC_USE_MOCK_WALLET"
    echo "NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: $NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID"
    # Use production config for static export
    cp next.config.js next.config.js.bak
    cp next.config.production.js next.config.js
    # Run the build command
    npm run build
    # Restore original config
    mv next.config.js.bak next.config.js
    ;;
  sync)
    echo "Syncing for site: $site"
    if [ -n "$aws_profile" ]; then
      aws s3 sync --delete ./out/ s3://$S3_BUCKET --profile $aws_profile
    else
      aws s3 sync --delete ./out/ s3://$S3_BUCKET
    fi
    ;;
  clear_cache)
    echo "Clearing CloudFront cache for site: $site"
    if [ -z "$CLOUDFRONT_ID" ]; then
      echo "Warning: CLOUDFRONT_ID not set, skipping cache invalidation"
      exit 0
    fi
    if [ -n "$aws_profile" ]; then
      aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_ID --paths "/*" --profile $aws_profile
    else
      aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_ID --paths "/*"
    fi
    ;;
  *)
    echo "Unknown command: $command"
    exit 1
    ;;
esac
