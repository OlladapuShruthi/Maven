package com.example.web.servlet;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for web servlets
 */
class CalculatorServletTest {
    
    @Test
    @DisplayName("Test servlet instantiation")
    void testServletCreation() {
        CalculatorServlet servlet = new CalculatorServlet();
        assertNotNull(servlet);
    }
}
