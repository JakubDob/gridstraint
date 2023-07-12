package com.github.jakubdob.gridsolver.messaging;

import com.github.jakubdob.gridsolver.api.SseManager;
import com.github.jakubdob.gridsolver.solvermodel.SolverInput;
import com.github.jakubdob.gridsolver.solvermodel.SolverOutput;
import lombok.RequiredArgsConstructor;
import org.springframework.jms.annotation.JmsListener;
import org.springframework.jms.core.JmsTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;

import static java.util.Objects.nonNull;

@Service
@RequiredArgsConstructor
public class JmsMessenger {
    private final JmsTemplate jmsTemplate;
    private final SseManager sseManager;
    @JmsListener(destination = "solution")
    private void handleSolution(SolverOutput solverOutput) {
        if(nonNull(solverOutput.userId())){
            try{
                var event = SseEmitter.event().data(solverOutput);
                sseManager.get(solverOutput.userId()).send(event);
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        }
        else{
            throw new IllegalStateException("UserId is null");
        }
    }

    public SseEmitter sendModel(SolverInput solverInput) {
        jmsTemplate.convertAndSend("model", solverInput);
        return sseManager.get(solverInput.getUserId());
    }
}
