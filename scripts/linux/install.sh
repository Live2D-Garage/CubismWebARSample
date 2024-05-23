#!/usr/bin/env sh

set -ue

NODE_VERION=v20.11.0
CUBISM_SDK_VERSION=5-r.1-beta.4

NODE_DL_URL=https://nodejs.org/dist/$NODE_VERION/node-$NODE_VERION-linux-x64.tar.xz
SDK_DL_URL=https://cubism.live2d.com/sdk-web/bin/CubismSdkForWeb-$CUBISM_SDK_VERSION.zip

cd $(dirname $0)/../../

rm -rf .temp .node CubismWebSamples
mkdir -p .temp .node CubismWebSamples

echo '# Installing Node.js...\n'
curl -fsSL -o ./.temp/node.tar.gz $NODE_DL_URL
tar -Jxf ./.temp/node.tar.gz -C ./.temp/
mv -f ./.temp/node-*/* ./.node/

echo '# Installing Cubism SDK...\n'
curl -fsSL -o ./.temp/sdk.zip $SDK_DL_URL
unzip -oq ./.temp/sdk.zip -d ./.temp/
mv -f ./.temp/Cubism*/* ./CubismWebSamples/

rm -rf ./.temp/

echo '# Install dependency packages\n'
export PATH=`pwd`/.node/bin:$PATH
npm ci

echo '\n# Script completed successfully\n'
