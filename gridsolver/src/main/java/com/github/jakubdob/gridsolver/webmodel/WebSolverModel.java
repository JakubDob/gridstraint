package com.github.jakubdob.gridsolver.webmodel;

import java.util.List;

public record WebSolverModel(
        List<WebConstraint> constraints,
        GridSize gridSize,
        ValueRange valueRange,
        String solvingMethod,
        String problemName,
        Integer timeoutMs,
        boolean allSolutions,
        int[][] values) {
}
