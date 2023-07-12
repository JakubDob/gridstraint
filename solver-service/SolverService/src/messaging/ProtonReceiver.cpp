#include "ProtonReceiver.h"
#include <proton/work_queue.hpp>
#include <proton/receiver_options.hpp>
#include <proton/source_options.hpp>
#include <iostream>

ProtonReceiver::ProtonReceiver(proton::session session,
                               std::string const& address, std::mutex& outMut)
    : outMut(outMut) {
    session.open_receiver(
        address,
        proton::receiver_options().handler(*this).source(
            proton::source_options().capabilities({proton::symbol("queue")})));
}

proton::message ProtonReceiver::receive() {
    std::unique_lock<std::mutex> lock(mut);
    while (!closed && (!workQueue || buffer.empty())) {
        canReceive.wait(lock);
    }
    if (closed) {
        throw std::runtime_error("receiver closed");
    }
    proton::message message = std::move(buffer.front());
    buffer.pop();
    return message;
}

void ProtonReceiver::close() {
    std::scoped_lock lock(mut);
    if (!closed) {
        closed = true;
        canReceive.notify_all();
        if (workQueue) {
            workQueue->add(
                [this]() { this->receiverInstance.connection().close(); });
        }
    }
}

void ProtonReceiver::on_message(proton::delivery& delivery,
                                proton::message& message) {
    std::scoped_lock lock(mut);
    buffer.push(message);
    canReceive.notify_all();
}

void ProtonReceiver::on_receiver_open(proton::receiver& receiver) {
    receiverInstance = receiver;
    std::scoped_lock lock(mut);
    workQueue = &receiver.work_queue();
}

void ProtonReceiver::on_error(proton::error_condition const& e) {
    std::scoped_lock lock(outMut);
    std::cerr << "Error: " << e << std::endl;
    exit(1);
}