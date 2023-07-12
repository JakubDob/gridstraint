package com.github.jakubdob.gridsolver.solvermodel;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class AllDifferentConstraint extends AbstractConstraint {
    private final int[] indices;
    @Override
    public String toSolverString() {
        return "constraint alldifferent("+wrapInArray(indices)+");\n";
    }
}
