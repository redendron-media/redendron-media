#!/usr/bin/env bash
#
# Seeds the production database and media store from this machine.
#
#   ./scripts/seed-production.sh
#
# Replays the same scripts, in the same order, that built the local database.
# Because every entity is looked up by a natural key first, each one is
# idempotent and the whole thing is safe to re-run.
#
# It reads NEON_DATABASE_URI rather than DATABASE_URI on purpose: local
# development stays on SQLite, and pointing a seed at production has to be a
# deliberate act rather than whatever happens to be in the environment.
set -euo pipefail
cd "$(dirname "$0")/.."

# shellcheck disable=SC1091
set -a; . ./.env; set +a

require() {
  if [ -z "${!1:-}" ]; then
    echo "error: $1 is not set in .env — $2" >&2
    exit 1
  fi
}

require NEON_DATABASE_URI "the production Postgres connection string"
require BLOB_READ_WRITE_TOKEN "create a Blob store in Vercel and copy its token"
require PAYLOAD_SECRET "run: openssl rand -base64 32"

case "$NEON_DATABASE_URI" in
  postgres://*|postgresql://*) ;;
  *) echo "error: NEON_DATABASE_URI is not a Postgres URL" >&2; exit 1 ;;
esac

# The source files for the import live outside git (they are large and they
# are not source). Without them the import would run and quietly produce a
# site with no pictures, which is worse than not running at all.
for dir in sanity-export/assets incoming; do
  if [ ! -d "$dir" ] || [ -z "$(ls -A "$dir" 2>/dev/null)" ]; then
    echo "error: $dir is missing or empty — the media import needs it" >&2
    exit 1
  fi
done

export DATABASE_URI="$NEON_DATABASE_URI"

echo "==> target: $(echo "$DATABASE_URI" | sed -E 's#//[^@]*@#//***@#')"
echo "==> media:  Vercel Blob"
echo

run() {
  echo "==> $*"
  "$@"
  echo
}

# Order matters: documents reference media, so the import that creates media
# has to go first, and the two top-ups have to go last.
# tsx, not `payload run`: the latter does not await an async top-level main(),
# so it exits as soon as the module finishes evaluating. Everything after the
# first await is killed, and the process still exits 0 - which is exactly how
# this seeded nothing and reported success.
run npx tsx scripts/import-payload.ts
run npx tsx scripts/assign-images.ts
run npx tsx scripts/fix-orphan-galleries.ts
run npx tsx scripts/seed-branding.ts
run npx tsx scripts/seed-services.ts

echo "==> done. Create the first admin at /admin on the deployed site."
