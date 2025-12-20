package com.algorithm.visualization.config;

import com.algorithm.visualization.model.User;
import com.algorithm.visualization.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initData(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            if (userRepository.count() == 0) {
                User user = new User();
                user.setUsername("admin");
                user.setPassword(passwordEncoder.encode("123456"));
                user.setNickname("Admin");
                userRepository.save(user);
                System.out.println("Default user created: admin / 123456");
            }
        };
    }
}
