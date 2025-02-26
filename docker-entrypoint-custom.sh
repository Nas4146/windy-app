#!/bin/sh
# This script patches the source code before starting the container.
# Adjust the target file path (/app/server/entries/endpoints/auth/callback/_server.ts)
# if necessary.

sed -i "s/secure: process.env.NODE_ENV === 'production'/secure: true, domain: '44.246.120.203'/g" .svelte-kit/output/server/entries/endpoints/auth/callback/_server.ts

exec "$@"