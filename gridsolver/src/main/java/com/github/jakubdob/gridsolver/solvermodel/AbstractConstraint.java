package com.github.jakubdob.gridsolver.solvermodel;

abstract class AbstractConstraint {
    public static final String ARRAY_NAME = "grid";
    public abstract String toSolverString();
    protected String wrapInArray(int[] indices) {
        var sb = new StringBuilder();
        sb.append("[");
        for(int i : indices){
            sb.append(ARRAY_NAME).append("[").append(i).append("]").append(",");
        }
        sb.deleteCharAt(sb.length() - 1);
        sb.append("]");
        return sb.toString();
    }
    protected String wrapInArray(int index) {
        return ARRAY_NAME + "[" + index + "]";
    }
}
