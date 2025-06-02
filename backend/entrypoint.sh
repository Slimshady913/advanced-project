#!/bin/sh

echo "Waiting for DB to be ready..."

# DB가 완전히 실행될 때까지 대기하는 코드를 여기에 추가할 수도 있습니다
# 예: nc -z db 5432

python manage.py migrate --noinput
python manage.py collectstatic --noinput
python manage.py runserver 0.0.0.0:8000