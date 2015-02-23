MAKEFLAGS += --warn-undefined-variables
SHELL := /bin/bash
.SHELLFLAGS := -eu -o pipefail
.DEFAULT_GOAL := all
.DELETE_ON_ERROR:
.SUFFIXES:

# Variables specific to this build
PG_HOST="localhost"
PG_USER="ubuntu"
PG_DB= "postgres"
PG_DB= #"lisc"
PG_PORT="5432"
BASE_DIR=$(dir $(lastword $(MAKEFILE_LIST)))
PROCESSORS=$(BASE_DIR)data/processors
