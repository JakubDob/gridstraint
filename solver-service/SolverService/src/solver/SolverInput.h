#pragma once

#include <string>

class SolverInput {
   public:
    SolverInput(std::string const& jsonData);
    bool hasErrors() const;
    std::string const& getErrorMessage() const;
    std::string const& getModel() const;
    std::string const& getUserId() const;
    std::string const& getProblemName() const;
    std::string const& getProblemId() const;
    bool getAllSolutions() const;
    unsigned getTimeoutMs() const;

   private:
    std::string userId;
    std::string model;
    std::string errorMessage;
    std::string problemName;
    std::string problemId;
    bool _hasErrors = false;
    bool allSolutions = false;
    unsigned timeoutMs = 10000;
};