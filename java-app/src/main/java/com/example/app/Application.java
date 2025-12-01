package com.example.app;

import com.example.service.CalculatorService;
import com.example.service.DataService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Main Application Class
 * Demonstrates Maven build, dependencies, and executable JAR generation
 */
public class Application {
    private static final Logger logger = LoggerFactory.getLogger(Application.class);
    
    public static void main(String[] args) {
        logger.info("Starting Java Application...");
        
        // Use CalculatorService
        CalculatorService calculator = new CalculatorService();
        int sum = calculator.add(10, 20);
        int product = calculator.multiply(5, 4);
        
        logger.info("Calculator Results:");
        logger.info("10 + 20 = {}", sum);
        logger.info("5 × 4 = {}", product);
        
        // Use DataService
        DataService dataService = new DataService();
        String jsonData = dataService.createJsonData("Sample", 123);
        String processed = dataService.processText("hello world");
        
        logger.info("Data Service Results:");
        logger.info("JSON: {}", jsonData);
        logger.info("Processed: {}", processed);
        
        logger.info("Application completed successfully!");
    }
}
