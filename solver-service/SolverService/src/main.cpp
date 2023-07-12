#include "messaging/ProtonClient.h"
#include "solver/SolverExecutor.h"

std::mutex outMut;
int main(int argc, char const** argv) {
    SolverExecutor executor;
    ProtonClient brokerClient("solution", "model", outMut);
    while (true) {
        auto msg = brokerClient.recv();
        SolverInput input(get<std::string>(msg.body()));
        auto output = executor.setAllSolutions(input.getAllSolutions())
                          .setTimeLimit(input.getTimeoutMs())
                          .execute(input);
        proton::message outputMessage(output.toJsonString());
        outputMessage.properties().put("_type", proton::scalar("SolverOutput"));
        brokerClient.send(outputMessage);
    }
    return 0;
}