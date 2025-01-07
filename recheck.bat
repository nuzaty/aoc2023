@echo off
for /l %%x in (1, 1, 25) do (
  for /l %%y in (1, 1, 2) do (
    call :SUB %%x %%y
    if errorlevel == 1 (
      echo Day %%x Part %%y command most likely exited with an error code: %errorlevel%
      exit /b %errorlevel%
    )
  )
)

exit /b %errorlevel%

:SUB outer inner
if %1 == 25 if %2 == 2 goto CONTINUE
echo Running Day %1 Part %2...
node ./build/index.js %1 %2 >NUL

:CONTINUE
rem
exit /B
