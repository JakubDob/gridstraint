#pragma once

#include <mutex>
#include <memory>
#include <thread>
#include <vector>
#include <atomic>
#include <condition_variable>
#include <proton/container.hpp>
#include <proton/message.hpp>
#include "ProtonSender.h"
#include "ProtonReceiver.h"

class ProtonClient : private proton::messaging_handler {
   public:
    ProtonClient(std::string const& sendQueueAddress,
                 std::string const& recvQueueAddress, std::mutex& outMutex);
    ProtonClient(ProtonClient&&) = delete;
    ProtonClient(ProtonClient&) = delete;
    ProtonClient& operator=(ProtonClient&) = delete;
    ProtonClient& operator=(ProtonClient&&) = delete;

    void send(proton::message message);
    proton::message recv();
    void close();

   private:
    std::atomic<bool> ioInitialized = false;
    std::mutex mut;
    std::mutex& outMut;
    std::condition_variable canIO;
    std::thread containerThread;
    std::string sendQueueAddress;
    std::string recvQueueAddress;
    proton::session session;
    std::unique_ptr<proton::container> container = nullptr;
    std::unique_ptr<ProtonSender> sender = nullptr;
    std::unique_ptr<ProtonReceiver> receiver = nullptr;

    void on_container_start(proton::container&) override;
    void on_connection_open(proton::connection&) override;
    void on_error(proton::error_condition const&) override;
};