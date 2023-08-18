#! /usr/bin/env bash

if [ -z $1 ]; then
    port=5678
else
    port="$1"
fi

uvicorn new:app --reload --host 0.0.0.0 --port $port
