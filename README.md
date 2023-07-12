# gridstraint

Project consists of 4 parts:
1. Angular web app sends a model
2. Spring app parses the model from the web app and sends it to the solver
3. Solver responds back to the spring app with the result
4. Artemis message broker facilitates the communication between 2 and 3

## Building

```
docker compose up
```

Web app runs on localhost:4444

## Screenshots
### Making a sudoku solver (all the values in rows, columns and 3x3 squares must be different)
![constraints](https://github.com/JakubDob/gridstraint/assets/105197235/fe98c1b6-39af-4be3-b36d-508c45d1050b)
![solution](https://github.com/JakubDob/gridstraint/assets/105197235/d79f299c-6377-44b3-99a6-e09e28a6faca)


### Solving n-queens problem (all 40 solutions to 7x7)
![all_solutions_7x7](https://github.com/JakubDob/gridstraint/assets/105197235/4f1d1f55-74ee-4bee-88e9-9487c36bc00d)
