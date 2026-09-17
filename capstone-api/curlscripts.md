curl -i -X POST http://localhost:4000/api/auth/login \
 -H "Content-Type: application/json" \
 -d '{"email":"admin@example.com","password":"Password123!"}'

curl -i -X GET http://localhost:4000/api/dashboard \
 -H "Authorization: Bearer <token>"

curl -i -X GET http://localhost:4000/api/health \

curl -i -X POST http://localhost:4000/api/claims \
 -H "Content-Type: application/json" \
 -H "Authorization: Bearer <token>" \
 -d '{"policy":"64...","description":"Test claim","amount":1000,"incidentDate":"2026-09-15T00:00:00.000Z"}'
