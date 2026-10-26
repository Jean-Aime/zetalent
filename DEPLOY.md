# ZeTalent VPS Deployment

This guide describes the production deployment layout used by ZeTalent:

- AlmaLinux VPS
- Nginx serves the built frontend from `/var/www/zetalent/frontend_dist`
- PM2 runs the API process `zetalent-api`
- PostgreSQL stores application data
- The public site and API use `https://zetalent-media.com`

Do not copy a local `.env` file, database dump, or uploaded media into the public
repository. Keep production secrets and backups outside the web root with
restricted permissions.

## Before deploying

1. Confirm the release has been reviewed and tested locally.
2. Take a PostgreSQL backup and a copy of the current backend and frontend.
   Store these outside the public web root and verify the backup can be read.
3. Build the frontend with the production API URL:

   ```powershell
   cd frontend
   $env:VITE_API_URL = "https://zetalent-media.com/api"
   npm ci
   npm run build
   ```

4. Confirm the generated `frontend/dist` assets do not contain a localhost API
   URL. Package only the release files needed by the server; never include
   `.env`, database dumps, or credentials.

## Deploying the private-article feature

The feature adds a migration at
`backend/supabase/migrations/20261022150000_add_private_news_links.sql`.
It adds a private token and permits the `private` status; it does not rewrite
existing article content or timestamps.

1. Upload and extract the reviewed release into a new, separate staging
   directory. Do not extract over the live application.
2. Apply the migration to the production PostgreSQL database as a privileged
   database operator. For example, copy the staged migration to a readable
   temporary path, then run:

   ```bash
   install -m 644 "$STAGE/backend/supabase/migrations/20261022150000_add_private_news_links.sql" \
     /tmp/20261022150000_add_private_news_links.sql
   runuser -u postgres -- psql -v ON_ERROR_STOP=1 -d zetalent \
     -f /tmp/20261022150000_add_private_news_links.sql
   ```

   Adapt the database name and privilege method to the server. Verify the new
   `private_token` column and that existing article counts/statuses are
   unchanged before continuing.
3. Back up the current backend files, then deploy the staged
   `backend/src/index.js` and `backend/src/routes/news.js`. Check JavaScript
   syntax and restart the existing PM2 process:

   ```bash
   node --check /var/www/zetalent/backend/src/index.js
   node --check /var/www/zetalent/backend/src/routes/news.js
   pm2 restart zetalent-api
   curl -fsS http://localhost:4000/api/health
   ```

4. Copy the staged frontend assets into the live frontend directory. Publish
   `index.html` last so it never refers to assets that have not been copied.
   Keep the existing Nginx configuration unchanged unless the release
   specifically requires an approved configuration change.
5. Verify the live site and API, confirm public news contains only published
   articles, and check that an unknown private token returns `404`. Confirm
   `nginx -t` succeeds if Nginx configuration was changed.

Private links are unguessable bearer URLs. Share them only with intended
recipients; anyone who has a link can view its article. Changing an article
away from private invalidates its private link.

## Routine updates

Use the same staged release procedure for future changes: back up first,
review the exact files being replaced, deploy only those files, run required
migrations before restarting the API, then publish frontend assets with
`index.html` last. Do not use a blind `git pull` into the live directory or
replace unrelated application files.

If verification fails, restore the backed-up application files and restart
PM2. Do not roll back a database migration by deleting columns if the new
application may already have written private-link data; plan a database
rollback separately and preserve the backup.

## Initial server provisioning

`setup.sh` is for a new server only, not for routine production updates. It
requires secrets to be provided in the environment and will create a database
user/database, install system packages, and configure services. Review the
script before running it and make sure it is not pointed at an existing
production server. Example environment setup (use unique values stored in a
password manager):

```bash
export DB_PASSWORD='use-a-new-strong-database-password'
export JWT_SECRET='use-a-new-random-secret-at-least-32-characters'
export ADMIN_EMAIL='admin@example.com'
read -rsp 'Admin password: ' ADMIN_PASSWORD
export ADMIN_PASSWORD
echo
bash setup.sh
unset DB_PASSWORD JWT_SECRET ADMIN_PASSWORD
```

The seed script requires `ADMIN_EMAIL` and `ADMIN_PASSWORD`; it does not
contain a default admin account or password.
