#include "ProtonClient.h"
#include <iostream>

ProtonClient::ProtonClient(std::string const& sendQueueAddress,
                           std::string const& recvQueueAddress,
                           std::mutex& outMut)
    : sendQueueAddress(sendQueueAddress),
      recvQueueAddress(recvQueueAddress),
      outMut(outMut) {
    container =
        std::unique_ptr<proton::container>(new proton::container(*this));
    containerThread = std::thread([&]() { container->run(); });
}

void ProtonClient::send(proton::message message) {
    if (!ioInitialized) {
        std::unique_lock<std::mutex> lock(mut);
        while (!ioInitialized) {
            canIO.wait(lock);
        }
    }
    sender->send(message);
}

proton::message ProtonClient::recv() {
    if (!ioInitialized) {
        std::unique_lock<std::mutex> lock(mut);
        while (!ioInitialized) {
            canIO.wait(lock);
        }
    }
    return receiver->receive();
}

void ProtonClient::close() {
    receiver->close();
    sender->close();
}

void ProtonClient::on_container_start(proton::container& container) {
    container.connect();
}

void ProtonClient::on_connection_open(proton::connection& connection) {
    sender = std::make_unique<ProtonSender>(connection.default_session(),
                                            sendQueueAddress, outMut);
    receiver = std::make_unique<ProtonReceiver>(connection.default_session(),
                                                recvQueueAddress, outMut);
    ioInitialized = true;
    canIO.notify_all();
}

void ProtonClient::on_error(proton::error_condition const& e) {
    std::scoped_lock lock(outMut);
    std::cerr << "Error: " << e << std::endl;
    exit(1);
}
