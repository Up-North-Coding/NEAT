#!/bin/bash

docker image inspect unc-neat:latest 2>&1 >/dev/null

if [ $? -ne 0 ]; then
    ./build.sh
fi

docker run \
    --rm   \
    -it    \
    -v $(pwd)/src/experiments/:/app/experiments/  \
    -v $(pwd)/src/lib/:/app/lib/  \
    -v $(pwd)/src/package.json:/app/package.json  \
    -p 127.0.0.1:9229:9229 \
    unc-neat:latest npm run experiment -- $@
