#pragma once

#include <string>
#include <unordered_map>
#include <vector>
#include "SolverInput.h"
#include "SolverOutput.h"

enum class SolverParam { TIME_LIMIT = 0, PARALLEL, ALL_SOLUTIONS };

class SolverExecutor {
   public:
    SolverExecutor();
    SolverOutput execute(SolverInput const& input);
    SolverExecutor& setTimeLimit(unsigned milliseconds);
    SolverExecutor& setParallel(unsigned value);
    SolverExecutor& setAllSolutions(bool value);

   protected:
    void updateMapParam(SolverParam param, std::string value);
    void updateBooleanParam(SolverParam param, bool value);
    void updateCommand();
    void parseOutput(SolverOutput& out) const;

   private:
    struct ParamData {
        std::string key;
        std::string value;
        bool isBool;
    };

    inline static const std::string SOLUTION_SEPARATOR_LINE = "----------";
    inline static const std::string SEARCH_COMPLETE_LINE = "==========";
    inline static const std::string SOLUTION_UNKNOWN_LINE = "=====UNKNOWN=====";
    inline static const std::string SOLUTION_ERROR_LINE = "=====ERROR=====";
    inline static const std::string SOLUTION_UNSATorUNBOUNDED_LINE =
        "=====UNSATorUNBOUNDED=====";
    inline static const std::string SOLUTION_UNBOUNDED_LINE =
        "=====UNBOUNDED=====";
    inline static const std::string SOLUTION_UNSATISFIABLE_LINE =
        "=====UNSATISFIABLE=====";

    std::unordered_map<SolverParam, ParamData> paramsMap;
    std::string command;
    std::vector<std::string> tmpOutputLines;
};
