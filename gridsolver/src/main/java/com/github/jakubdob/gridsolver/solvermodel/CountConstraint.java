package com.github.jakubdob.gridsolver.solvermodel;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
class CountConstraint extends AbstractConstraint {

    private final String relation;
    private final int amount;
    private final int countedValue;
    private final int[] indices;
    @Override
    public String toSolverString() {
        return "constraint count(" +
                wrapInArray(indices) +
                "," + countedValue +
                ")" + relation +
                amount + ";\n";
    }
}
