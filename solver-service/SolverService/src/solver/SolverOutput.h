#pragma once

#include <string>
#include <vector>
#include "SolverInput.h"

class SolverExecutor;
class SolverOutput {
    friend SolverExecutor;

   public:
    std::string toJsonString() const;
    bool hasErrors() const;

   private:
    SolverOutput(SolverInput const& input);
    void addResult(std::string result);
    void setErrorMessage(std::string errorMessage);
    void setStatus(std::string status);
    std::string userId;
    std::string problemId;
    std::string problemName;
    std::vector<std::string> results;
    std::string errorMessage;
    std::string status;
    bool _hasErrors = false;
};
