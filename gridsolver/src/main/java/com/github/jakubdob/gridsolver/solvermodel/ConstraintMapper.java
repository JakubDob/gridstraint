package com.github.jakubdob.gridsolver.solvermodel;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.util.Map;

@Mapper(componentModel = "spring")
public interface ConstraintMapper {
    default AbstractConstraint toConstraint(String constraintName, int[] indices, Map<String, Object> settings) {
        switch (constraintName) {
            case "alldifferent" -> {
                return new AllDifferentConstraint(indices);
            }
            case "count" -> {
                return toCount(indices, settings);
            }
        }
        return null;
    }

    @Mapping(source = "indices", target = "indices")
    @Mapping(source = "settings.relation", target = "relation", qualifiedByName = "objToStr")
    @Mapping(source = "settings.amount", target = "amount", qualifiedByName = "objToInt")
    @Mapping(source = "settings.countedValue", target = "countedValue", qualifiedByName = "objToInt")
    CountConstraint toCount(int[] indices, Map<String, Object> settings);

    @Named("objToInt")
    default int objToInt(Object obj) {
        return (int) obj;
    }

    @Named("objToStr")
    default String objToStr(Object obj) {
        return String.valueOf(obj);
    }
}
