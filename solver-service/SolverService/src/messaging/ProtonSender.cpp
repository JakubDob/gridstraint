#include "ProtonSender.h"
#include <proton/work_queue.hpp>
#include <proton/message.hpp>
#include <proton/sender_options.hpp>
#include <proton/target_options.hpp>
#include <iostream>

ProtonSender::ProtonSender(proton::session session, std::string const& address,
                           std::mutex& outMut)
    : outMut(outMut) {
    session.open_sender(
        address,
        proton::sender_options().handler(*this).target(
            proton::target_options().capabilities({proton::symbol("queue")})));
}

proton::work_queue* ProtonSender::getWorkQueue() {
    std::unique_lock<std::mutex> lock(mut);
    while (!workQueue) {
        canSend.wait(lock);
    }
    return workQueue;
}

void ProtonSender::send(proton::message const& message) {
    getWorkQueue()->add([=]() { senderInstance.send(message); });
}

void ProtonSender::close() {
    getWorkQueue()->add([=]() { senderInstance.connection().close(); });
}

void ProtonSender::on_sendable(proton::sender& sender) {
    std::scoped_lock lock(mut);
    canSend.notify_all();
}

void ProtonSender::on_sender_open(proton::sender& sender) {
    std::scoped_lock lock(mut);
    senderInstance = sender;
    workQueue = &sender.work_queue();
}

void ProtonSender::on_error(proton::error_condition const& e) {
    std::scoped_lock lock(outMut);
    std::cerr << "Error: " << e << std::endl;
    exit(1);
}