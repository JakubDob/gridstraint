#pragma once

#include <mutex>
#include <condition_variable>
#include <proton/messaging_handler.hpp>
#include <proton/sender.hpp>
#include <proton/container.hpp>
#include <proton/connection_options.hpp>

class ProtonSender : private proton::messaging_handler {
   public:
    ProtonSender(proton::session session, std::string const& address,
                 std::mutex& outMut);
    ProtonSender(ProtonSender&&) = delete;
    ProtonSender(ProtonSender&) = delete;
    ProtonSender& operator=(ProtonSender&) = delete;
    ProtonSender& operator=(ProtonSender&&) = delete;

    void send(proton::message const&);
    void close();

   private:
    std::mutex mut;
    std::mutex& outMut;
    std::condition_variable canSend;
    proton::sender senderInstance;
    proton::work_queue* workQueue = nullptr;

    proton::work_queue* getWorkQueue();

    void on_sender_open(proton::sender&) override;
    void on_sendable(proton::sender&) override;
    void on_error(proton::error_condition const&) override;
};