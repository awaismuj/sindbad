#!/usr/bin/env bash
# Nightly: crontab -e ->  0 2 * * * /var/www/sindbad/deploy/backup.sh
set -euo pipefail
DIR=/var/backups/sindbad; mkdir -p "$DIR"
mongodump --uri="$(grep ^MONGO_URI /var/www/sindbad/server/.env | cut -d= -f2-)" --archive="$DIR/sindbad-$(date +%F).gz" --gzip
UPLOAD_DIR=$(sed -n 's/^UPLOAD_DIR=//p' /var/www/sindbad/server/.env | tail -n 1)
UPLOAD_DIR=${UPLOAD_DIR:-/var/www/sindbad/uploads}
if [ -d "$UPLOAD_DIR" ]; then
    tar -czf "$DIR/media-$(date +%F).tar.gz" -C "$UPLOAD_DIR" .
fi
find "$DIR" -name 'sindbad-*.gz' -mtime +14 -delete
find "$DIR" -name 'media-*.tar.gz' -mtime +14 -delete
# Also copy $DIR off this server (rsync/rclone), a backup on the same VPS is lost if the VPS is lost.
