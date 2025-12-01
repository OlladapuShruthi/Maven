package com.example.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/**
 * Unit tests for CalculatorService
 * Demonstrates JUnit 5 testing
 */
class CalculatorServiceTest {
    
    private CalculatorService calculator;
    
    @BeforeEach
    void setUp() {
        calculator = new CalculatorService();
    }
    
    @Test
    @DisplayName("Test addition of positive numbers")
    void testAdd() {
        assertEquals(30, calculator.add(10, 20));
        assertEquals(0, calculator.add(-5, 5));
    }
    
    @Test
    @DisplayName("Test subtraction")
    void testSubtract() {
        assertEquals(10, calculator.subtract(20, 10));
        assertEquals(-10, calculator.subtract(5, 15));
    }
    
    @Test
    @DisplayName("Test multiplication")
    void testMultiply() {
        assertEquals(20, calculator.multiply(5, 4));
        assertEquals(0, calculator.multiply(10, 0));
    }
    
    @Test
    @DisplayName("Test division")
    void testDivide() {
        assertEquals(2.0, calculator.divide(10, 5));
        assertEquals(2.5, calculator.divide(5, 2));
    }
    
    @Test
    @DisplayName("Test division by zero throws exception")
    void testDivideByZero() {
        assertThrows(IllegalArgumentException.class, () -> {
            calculator.divide(10, 0);
        });
    }
}
