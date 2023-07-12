package com.github.jakubdob.gridsolver.api;

import com.github.jakubdob.gridsolver.messaging.JmsMessenger;
import com.github.jakubdob.gridsolver.solvermodel.ModelCreator;
import com.github.jakubdob.gridsolver.solvermodel.SolverInput;
import com.github.jakubdob.gridsolver.webmodel.WebSolverModel;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.UUID;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api")
public class SolverController {
    private final JmsMessenger jmsMessenger;
    private final ModelCreator modelCreator;
    private final SseManager sseManager;

    @PostMapping("/model")
    public ResponseEntity<String> postModel(@RequestBody WebSolverModel webModel, @CookieValue("JSESSIONID") String sessionId) {
        if(sseManager.contains(sessionId)){
            var solverModel = SolverInput.builder()
                    .userId(sessionId)
                    .timeoutMs(webModel.timeoutMs())
                    .problemId(UUID.randomUUID().toString())
                    .problemName(webModel.problemName())
                    .model(modelCreator.buildSolverModel(webModel))
                    .allSolutions(webModel.allSolutions())
                    .build();
            jmsMessenger.sendModel(solverModel);
            return ResponseEntity.ok().build();
        }
        else{
            return ResponseEntity.badRequest().body("session is invalid");
        }
    }

    @GetMapping(value = "/connect", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public ResponseEntity<SseEmitter> connect(HttpServletRequest request) {
        var sessionId = request.getSession().getId();
        return ResponseEntity.ok().body(sseManager.get(sessionId));
    }

    @GetMapping(value = "/session")
    public ResponseEntity<Void> createSessionCookie(HttpServletRequest request) {
        request.getSession();
        return ResponseEntity.ok().build();
    }
}
