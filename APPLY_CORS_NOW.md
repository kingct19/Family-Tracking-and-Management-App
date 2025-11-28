# 🔧 Apply CORS Configuration Now

## Quick Command (Copy & Paste)

Since CORS isn't visible in the Google Cloud Console UI, use this command:

```bash
gsutil cors set cors-config.json gs://group-safety-app.firebasestorage.app
```

## Verify It Worked

After running the command, verify the CORS configuration:

```bash
gsutil cors get gs://group-safety-app.firebasestorage.app
```

You should see the JSON configuration with your origins listed.

## That's It!

- ✅ CORS configuration will be applied immediately
- ✅ Changes may take 30-60 seconds to propagate
- ✅ Refresh your browser to see Firebase Storage images load

## Troubleshooting

**If you get an authentication error:**
```bash
gcloud auth login
gcloud config set project group-safety-app
```

**If you get a bucket not found error:**
The bucket name might be different. List your buckets:
```bash
gsutil ls
```

Then use the bucket name that matches `group-safety-app.*`

