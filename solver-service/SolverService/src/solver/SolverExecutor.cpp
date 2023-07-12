#include "SolverExecutor.h"
#include <boost/process.hpp>
#include <boost/process/extend.hpp>

SolverExecutor::SolverExecutor() {
    paramsMap = {
        {SolverParam::TIME_LIMIT, {"--solver-time-limit", "10000", false}},
        {SolverParam::PARALLEL, {"--parallel", "4", false}},
        {SolverParam::ALL_SOLUTIONS, {"--all-solutions", "OFF", true}},
    };
    tmpOutputLines.reserve(256);
}

void SolverExecutor::updateMapParam(SolverParam param, std::string value) {
    paramsMap[param].value = value;
}

void SolverExecutor::updateBooleanParam(SolverParam param, bool value) {
    paramsMap[param].value = value ? "ON" : "OFF";
}

void SolverExecutor::updateCommand() {
    command.clear();
    command = "minizinc --input-from-stdin ";
    for (auto const& [_, data] : paramsMap) {
        auto&& [paramName, paramValue, isBool] = data;
        if (isBool) {
            if (paramValue == "ON") {
                command += paramName + " ";
            }
        } else {
            command += paramName + " " + paramValue + " ";
        }
    }
}

SolverExecutor& SolverExecutor::setTimeLimit(unsigned milliseconds) {
    updateMapParam(SolverParam::TIME_LIMIT, std::to_string(milliseconds));
    return *this;
}

SolverExecutor& SolverExecutor::setParallel(unsigned parallel) {
    updateMapParam(SolverParam::PARALLEL, std::to_string(parallel));
    return *this;
}

SolverExecutor& SolverExecutor::setAllSolutions(bool value) {
    updateBooleanParam(SolverParam::ALL_SOLUTIONS, value);
    return *this;
}

void SolverExecutor::parseOutput(SolverOutput& out) const {
    if (tmpOutputLines.empty()) {
        out.setErrorMessage(
            "Solver has not returned anything, possibly the model is "
            "incorrect.");
        return;
    }
    auto const& status = tmpOutputLines.back();
    if (status == SOLUTION_SEPARATOR_LINE || status == SEARCH_COMPLETE_LINE) {
        if (status == SOLUTION_SEPARATOR_LINE) {
            out.setStatus("SAT");
        } else {
            out.setStatus("COMPLETE");
        }
        std::string result;
        for (int i = 0; i < tmpOutputLines.size(); ++i) {
            auto const& line = tmpOutputLines[i];
            if (line == SOLUTION_SEPARATOR_LINE) {
                out.addResult(result);
                result.clear();
            } else {
                result += line;
            }
        }
    } else if (status == SOLUTION_UNSATISFIABLE_LINE) {
        out.setStatus("UNSAT");
    } else if (status == SOLUTION_UNKNOWN_LINE) {
        out.setStatus("UNKNOWN");
    } else if (status == SOLUTION_ERROR_LINE) {
        out.setStatus("ERROR");
    } else if (status == SOLUTION_UNSATorUNBOUNDED_LINE) {
        out.setStatus("UNSATorUNBOUNDED");
    } else if (status == SOLUTION_UNBOUNDED_LINE) {
        out.setStatus("UNBOUNDED");
    } else {
        out.setStatus("not implemented: " + status);
    }
}

SolverOutput SolverExecutor::execute(SolverInput const& input) {
    SolverOutput ret(input);
    if (ret.hasErrors()) {
        return ret;
    }

    updateCommand();
    tmpOutputLines.clear();
    namespace bp = boost::process;

    bp::ipstream pipeOutStream;
    bp::opstream pipeInStream;
    bp::ipstream pipeErrStream;

    try {
        bp::child solverProcess{
            bp::cmd = command,
            bp::extend::on_error =
                [&](auto& executor, boost::system::error_code const& ec) {
                    if (ec) {
                        ret.setErrorMessage("Error during the execution: " +
                                            ec.message());
                    }
                },
            bp::std_out > pipeOutStream,
            bp::std_in<pipeInStream, bp::std_err> pipeErrStream};

        pipeInStream << input.getModel() << std::flush;
        pipeInStream.pipe().close();
        std::string line;
        while (solverProcess.running() && std::getline(pipeOutStream, line) &&
               !line.empty()) {
            line.erase(
                std::remove_if(line.begin() + line.size() - 2, line.end(),
                               [](char const c) { return c == '\r'; }),
                line.end());
            tmpOutputLines.emplace_back(line);
        }
        line.clear();
        std::string solverError;
        while (solverProcess.running() && std::getline(pipeErrStream, line) &&
               !line.empty()) {
            solverError += line;
        }
        solverProcess.wait();
        if (!solverError.empty()) {
            ret.setErrorMessage(solverError);
        }
    } catch (std::exception const& e) {
        ret.setErrorMessage("Error during the execution " +
                            std::string(e.what()));
    }
    if (!ret.hasErrors()) {
        parseOutput(ret);
    }
    return ret;
}