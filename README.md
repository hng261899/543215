# Upload this folder to Vercel

## Why you saw “page does not exist”

Vercel only had one HTML file. Links like `/portal` are real URLs, so Vercel looked for a `/portal` file and returned 404.

## Fix

1. Deploy the **entire `vercel-deploy` folder** as the project root
2. Make sure the homepage file is named **`index.html`**
3. Keep **`vercel.json`** in the same folder (it rewrites `/portal`, `/apply`, etc. back to `index.html`)

Framework preset: **Other**  
Build command: empty  
Output directory: `.`

Then these URLs work:
- `/`
- `/portal`
- `/apply`
- `/applications`
- `/results`
- `/support`
- `/reimbursement`
