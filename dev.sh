#!/bin/bash

docker image inspect unc-neat:latest 2>&1 >/dev/null

if [ $? -ne 0 ]; then
    ./build.sh
fi

docker run \
    --rm   \
    -it    \
    -v $(pwd)/src/lib/:/app/lib/  \
    -v $(pwd)/src/package.json:/app/package.json  \
    unc-neat:latest
