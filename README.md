# Learning-Management-System-

## Persisting uploaded course images on Render

Render's application filesystem is temporary unless the service has a persistent
disk. To keep uploaded thumbnails available after deploys and restarts:

1. Attach a persistent disk to the backend web service in Render (for example,
   with mount path `/var/data`).
2. Set the backend environment variable `MEDIA_ROOT` to `/var/data/media`.
3. Redeploy the backend. New uploads will be stored on the disk and served at
   their existing `/media/` URLs.

Images uploaded before the disk was configured may no longer exist on the
backend. Re-upload those course thumbnails after the disk is mounted.