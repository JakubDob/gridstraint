package com.github.jakubdob.gridsolver.solvermodel;

import com.github.jakubdob.gridsolver.webmodel.WebSolverModel;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ModelCreator {
    private final ConstraintMapper mapper;
    public String buildSolverModel(WebSolverModel model) {
        var sb = new StringBuilder();
        var gridLen = model.gridSize().cols() * model.gridSize().rows() - 1;
        sb.append("include \"globals.mzn\";\n")
                .append("array [0..")
                .append(gridLen)
                .append("] of var ")
                .append(model.valueRange().min())
                .append("..")
                .append(model.valueRange().max())
                .append(": ")
                .append(AbstractConstraint.ARRAY_NAME)
                .append(";\n");
        for(var webConstraint : model.constraints()) {
            for(var view : webConstraint.views()) {
                for(var group : view.indices()) {
                    var solverConstraint = mapper.toConstraint(webConstraint.name(), group, view.settings());
                    sb.append(solverConstraint.toSolverString());
                }
            }
        }
        sb.append(new ValueConstraint(model.values()).toSolverString());
        sb.append("solve ").append(model.solvingMethod());
        if(!model.solvingMethod().equals("satisfy")){
            sb.append(" sum("+AbstractConstraint.ARRAY_NAME+")");
        }
        sb.append(";\n")
                .append("output[")
                .append("show(")
                .append(AbstractConstraint.ARRAY_NAME)
                .append(")];");
        return sb.toString();
    }
}
