#!/bin/bash
# Start the live-service in a fully detached way
cd /home/z/my-project/mini-services/live-service

# Double-fork technique to fully detach from parent shell
(
  setsid bun index.ts >> /tmp/live-service.log 2>&1 &
)

echo "live-service launcher done"
