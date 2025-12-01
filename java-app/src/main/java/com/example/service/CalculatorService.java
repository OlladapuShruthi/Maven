package com.example.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Calculator Service
 * Demonstrates basic business logic with logging
 */
public class CalculatorService {
    private static final Logger logger = LoggerFactory.getLogger(CalculatorService.class);
    
    public int add(int a, int b) {
        logger.debug("Adding {} + {}", a, b);
        return a + b;
    }
    
    public int subtract(int a, int b) {
        logger.debug("Subtracting {} - {}", a, b);
        return a - b;
    }
    
    public int multiply(int a, int b) {
        logger.debug("Multiplying {} × {}", a, b);
        return a * b;
    }
    
    public double divide(int a, int b) {
        if (b == 0) {
            logger.error("Division by zero attempted");
            throw new IllegalArgumentException("Cannot divide by zero");
        }
        logger.debug("Dividing {} ÷ {}", a, b);
        return (double) a / b;
    }
}
