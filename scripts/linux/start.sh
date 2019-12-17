#!/usr/bin/env sh

set -ue

cd $(dirname $0)/../../

export PATH=`pwd`/.node/bin:$PATH

npm run start
