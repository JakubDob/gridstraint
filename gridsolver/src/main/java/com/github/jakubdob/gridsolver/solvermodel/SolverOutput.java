package com.github.jakubdob.gridsolver.solvermodel;

import java.util.List;
public record SolverOutput(
        String userId,
        String problemId,
        String problemName,
        List<List<String>> results,
        String errorMessage,
        String status) { }
