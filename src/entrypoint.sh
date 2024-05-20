#!/bin/sh

sqldb='/opt/app/data/episodes.db'
if [ ! -f ${sqldb} ]; then
  echo "Initializing database"
  sqlite3 ${sqldb} < schema.sql
fi
node index.js
