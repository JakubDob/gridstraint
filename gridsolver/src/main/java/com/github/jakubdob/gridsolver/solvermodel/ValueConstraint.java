package com.github.jakubdob.gridsolver.solvermodel;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
class ValueConstraint extends AbstractConstraint {
    private final int[][] values;
    @Override
    public String toSolverString() {
        var sb = new StringBuilder();
        for(var v : values){
            sb.append("constraint ").append(wrapInArray(v[0])).append("=").append(v[1]).append(";\n");
        }
        return sb.toString();
    }
}
