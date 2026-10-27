@echo off
echo Starting local MongoDB server...
start "" /b "%USERPROFILE%\mongodb\MongoDB\Server\9.0\bin\mongod.exe" --dbpath "%USERPROFILE%\mongodb\data" --bind_ip 127.0.0.1 --port 27017
echo MongoDB is running on 127.0.0.1:27017
