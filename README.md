# gridstraint

Project consists of 4 parts:
1. Angular web app sends a model
2. Spring app parses the model from the web app and sends it to the solver
3. Solver responds back to the spring app with the result
4. Artemis message broker facilitates the communication between 2 and 3

## Building

```
docker-compose up
```

Web app runs on localhost:4444

## Screenshots
### Making a sudoku solver (all the values in rows, columns and 3x3 squares must be different)
![constraints](https://github.com/JakubDob/gridstraint/assets/105197235/39f0139f-30bf-456c-8d36-2b8cc36ab1cf)
![solution](https://github.com/JakubDob/gridstraint/assets/105197235/6231c468-0d65-4c70-acfc-3f6fca45051d)

### Solving n-queens problem (all 40 solutions to 7x7)

![all_solutions_7x7](https://github.com/JakubDob/gridstraint/assets/105197235/6c0ec75a-b0e1-4297-a3cd-92e1d9e6b07f)
