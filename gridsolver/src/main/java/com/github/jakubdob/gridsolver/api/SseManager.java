package com.github.jakubdob.gridsolver.api;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
@Slf4j
@Service
public class SseManager {
    private final ConcurrentMap<String, SseEmitter> emitters = new ConcurrentHashMap<>();

    public SseEmitter get(String identifier) {
        var storedEmitter = emitters.get(identifier);
        if(storedEmitter != null) {
            return storedEmitter;
        }
        final var emitter = new SseEmitter(0L);
        emitter.onTimeout(() -> {
            log.info("(Timeout) Removing sse with identifier "+ identifier);
            emitters.remove(identifier);
        });
        emitter.onError((error) -> {
            log.info("(Error) Removing sse with identifier " + identifier + ". Error message: "+error.toString());
            emitters.remove(identifier);
        });
        emitters.put(identifier, emitter);
        return emitter;
    }
    public boolean contains(String identifier) {
        return emitters.containsKey(identifier);
    }

}
