curl -i -X POST http://localhost:4000/api/auth/login \
 -H "Content-Type: application/json" \
 -d '{"email":"admin@example.com","password":"Password123!"}'

curl -i -X GET http://localhost:4000/api/dashboard \
 -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YWE0NTc1MzA3MzYzNzQ4ZmIyYTgyMGMiLCJpYXQiOjE3ODk0ODQ0MzcsImV4cCI6MTc4OTU3MDgzN30.oad_rzQt01MLGij-TuNvou11UveMJtzX1kzkUKBUjQ4","user":{"id":"6aa4575307363748fb2a820c"

curl -i -X GET http://localhost:4000/api/health \
 -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YWE0NTc1MzA3MzYzNzQ4ZmIyYTgyMGMiLCJpYXQiOjE3ODk0ODQ0MzcsImV4cCI6MTc4OTU3MDgzN30.oad_rzQt01MLGij-TuNvou11UveMJtzX1kzkUKBUjQ4"

curl -i -X POST http://localhost:4000/api/claims \
 -H "Content-Type: application/json" \
 -H "Authorization: Bearer <token>" \
 -d '{"policy":"64...","description":"Test claim","amount":1000,"incidentDate":"2026-09-15T00:00:00.000Z"}'
