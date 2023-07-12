#include "SolverInput.h"
#include <json/json.h>

SolverInput::SolverInput(std::string const& jsonData) {
    Json::Value parsedJson;
    Json::Reader reader;
    std::vector<std::string> errors;
    reader.parse(jsonData.c_str(), parsedJson);

    if (parsedJson.isMember("userId")) {
        this->userId = parsedJson["userId"].asString();
    } else {
        errors.push_back("'userId' field is missing");
    }
    if (parsedJson.isMember("model")) {
        this->model = parsedJson["model"].asString();
    } else {
        errors.push_back("'model' field is missing");
    }
    if (parsedJson.isMember("problemId")) {
        this->problemId = parsedJson["problemId"].asString();
    } else {
        errors.push_back("'problemId' field is missing");
    }
    if (parsedJson.isMember("problemName")) {
        this->problemName = parsedJson["problemName"].asString();
    }
    if (parsedJson.isMember("timeoutMs")) {
        this->timeoutMs = parsedJson["timeoutMs"].asUInt();
        if (timeoutMs == 0) {
            timeoutMs = 1;
        }
    }
    if (parsedJson.isMember("allSolutions")) {
        this->allSolutions = parsedJson["allSolutions"].asBool();
    }

    if (!errors.empty()) {
        this->_hasErrors = true;

        for (int i = 0; i < errors.size(); ++i) {
            this->errorMessage += errors[i];
            if (i != errors.size() - 1) {
                this->errorMessage += '\n';
            }
        }
    }
}

bool SolverInput::hasErrors() const { return _hasErrors; }

bool SolverInput::getAllSolutions() const { return allSolutions; }

std::string const& SolverInput::getErrorMessage() const { return errorMessage; }

std::string const& SolverInput::getModel() const { return model; }

std::string const& SolverInput::getUserId() const { return userId; }

std::string const& SolverInput::getProblemName() const { return problemName; };

std::string const& SolverInput::getProblemId() const { return problemId; };

unsigned SolverInput::getTimeoutMs() const { return timeoutMs; }