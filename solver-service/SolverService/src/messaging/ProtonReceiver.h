#pragma once

#include <mutex>
#include <queue>
#include <condition_variable>
#include <proton/messaging_handler.hpp>
#include <proton/receiver.hpp>
#include <proton/container.hpp>
#include <proton/connection_options.hpp>
#include <proton/message.hpp>

class ProtonReceiver : private proton::messaging_handler {
   public:
    ProtonReceiver(proton::session session, std::string const& address,
                   std::mutex& outMut);
    ProtonReceiver(ProtonReceiver&&) = delete;
    ProtonReceiver(ProtonReceiver&) = delete;
    ProtonReceiver& operator=(ProtonReceiver&) = delete;
    ProtonReceiver& operator=(ProtonReceiver&&) = delete;

    proton::message receive();
    void close();

   private:
    std::mutex mut;
    std::mutex& outMut;
    std::condition_variable canReceive;
    proton::receiver receiverInstance;
    proton::work_queue* workQueue = nullptr;
    std::queue<proton::message> buffer;
    bool closed = false;

    void on_receiver_open(proton::receiver&) override;
    void on_message(proton::delivery&, proton::message&) override;
    void on_error(proton::error_condition const&) override;
};