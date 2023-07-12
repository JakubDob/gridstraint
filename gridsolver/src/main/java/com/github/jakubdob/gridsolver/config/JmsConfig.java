package com.github.jakubdob.gridsolver.config;

import jakarta.jms.ConnectionFactory;
import org.apache.qpid.jms.JmsConnectionFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jms.config.DefaultJmsListenerContainerFactory;
import org.springframework.jms.core.JmsTemplate;
import org.springframework.jms.support.converter.MappingJackson2MessageConverter;
import org.springframework.jms.support.converter.MessageConverter;
import org.springframework.jms.support.converter.MessageType;

import java.util.HashMap;
import java.util.Map;

@Configuration
class JmsConfig {
    private final String userName;
    private final String password;
    private final String remoteURI;

    JmsConfig(@Value("${artemis.userName}") String userName,
              @Value("${artemis.password}") String password,
              @Value("${artemis.protocol}") String protocol,
              @Value("${artemis.host}") String host,
              @Value("${artemis.port}") String port) {
        this.userName = userName;
        this.password = password;
        remoteURI = protocol + "://" + host + ":" + port;
    }
    @Bean
    ConnectionFactory connectionFactory() {
        return new JmsConnectionFactory(userName, password, remoteURI);
    }

    @Bean
    JmsTemplate jmsTemplate(ConnectionFactory connectionFactory) {
        var jmsTemplate = new JmsTemplate();
        jmsTemplate.setConnectionFactory(connectionFactory);
        jmsTemplate.setMessageConverter(jacksonJmsMessageConverter());
        return jmsTemplate;
    }
    @Bean
    DefaultJmsListenerContainerFactory jmsListenerContainerFactory(ConnectionFactory connectionFactory){
        var factory = new DefaultJmsListenerContainerFactory();
        factory.setConnectionFactory(connectionFactory);
        factory.setMessageConverter(jacksonJmsMessageConverter());
        return factory;
    }
    @Bean
    MessageConverter jacksonJmsMessageConverter() {
        var converter = new MappingJackson2MessageConverter();
        converter.setTargetType(MessageType.TEXT);
        converter.setTypeIdPropertyName("_type");
        Map<String, Class<?>> typeIdMappings = new HashMap<>();
        typeIdMappings.put("SolverOutput", com.github.jakubdob.gridsolver.solvermodel.SolverOutput.class);
        converter.setTypeIdMappings(typeIdMappings);
        return converter;
    }

}
