#!/bin/sh

# For security purposes, this should be run at consistent intervals
# in order to rotate secret values.

openssl rand -base64 32