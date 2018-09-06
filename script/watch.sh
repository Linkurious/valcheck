#!/bin/bash

# Typescript watcher helper
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"
ROOTDIR=${DIR/script/}
export ROOTDIR

sleep 1
while [[ `echo \`wc -c watch.out\` | awk '{print $1}'` < 100 ]]; do
  sleep 0.2
done

perl -pe 's/^([a-zA-Z])/$ENV{ROOTDIR}${1}/' watch.out
> watch.out
