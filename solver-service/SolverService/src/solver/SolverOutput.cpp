#include "SolverOutput.h"
#include <json/json.h>
#include <sstream>

SolverOutput::SolverOutput(SolverInput const& input)
    : userId(input.getUserId()),
      problemId(input.getProblemId()),
      problemName(input.getProblemName()) {
    if (input.hasErrors()) {
        setErrorMessage(input.getErrorMessage());
    }
}

std::string SolverOutput::toJsonString() const {
    Json::Value msg;
    msg["userId"] = userId;
    msg["problemId"] = problemId;
    msg["problemName"] = problemName;
    if (_hasErrors) {
        msg["errorMessage"] = this->errorMessage;
    } else {
        Json::Value resultsArr(Json::arrayValue);
        for (auto const& result : results) {
            Json::Value innerArr(Json::arrayValue);
            auto noBrackets = result.substr(1, result.size() - 2);
            std::string value;
            std::stringstream ss(noBrackets);
            while (std::getline(ss, value, ',')) {
                auto start = value.find_first_not_of(" ");
                auto end = value.find_last_not_of(" ");
                value = value.substr(start, end - start + 1);
                innerArr.append(value);
            }
            resultsArr.append(innerArr);
        }
        msg["results"] = resultsArr;
        msg["status"] = status;
    }
    Json::StreamWriterBuilder builder;
    builder["indentation"] = "";
    return Json::writeString(builder, msg);
}

void SolverOutput::addResult(std::string result) {
    this->results.push_back(result);
}

void SolverOutput::setErrorMessage(std::string errorMessage) {
    this->errorMessage = errorMessage;
    this->_hasErrors = true;
}

void SolverOutput::setStatus(std::string status) { this->status = status; }

bool SolverOutput::hasErrors() const { return _hasErrors; }