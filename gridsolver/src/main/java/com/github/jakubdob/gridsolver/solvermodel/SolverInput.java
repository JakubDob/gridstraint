package com.github.jakubdob.gridsolver.solvermodel;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Builder
@Getter
public class SolverInput {
    private final String userId;
    private final String problemId;
    private final String problemName;
    private final String model;
    @Setter
    private Integer timeoutMs;
    @Setter
    private Boolean allSolutions;
}
