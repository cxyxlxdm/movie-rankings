# Deploy Hook for movie-rankings

This file creates a Vercel Deployment Hook to manually trigger fresh builds.

1. Go to Vercel Project Settings → Git → Deployment Hooks
2. Create a new hook named "manual-deploy"
3. Copy the hook URL here (or store in env var)

Example usage:
```bash
curl -X POST $VERCEL_DEPLOY_HOOK_URL
```