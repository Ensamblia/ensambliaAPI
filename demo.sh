#!/usr/bin/env bash
# Prepara la base local para la demo: aplica migraciones y carga los datos de ejemplo.
# Uso:  ./demo.sh                       (contraseña común aleatoria, se imprime)
#       ./demo.sh --password LA_CLAVE   (contraseña común fija)
# Es repetible: no duplica datos. Solo funciona con DEBUG=True y no toca datos reales.
set -euo pipefail
cd "$(dirname "$0")"
PY=python
[ -x .venv/bin/python ] && PY=.venv/bin/python
"$PY" manage.py migrate
"$PY" manage.py seed_demo "$@"
