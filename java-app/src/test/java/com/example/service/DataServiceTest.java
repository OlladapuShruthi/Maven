package com.example.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/**
 * Unit tests for DataService
 * Demonstrates testing with external dependencies
 */
class DataServiceTest {
    
    private DataService dataService;
    
    @BeforeEach
    void setUp() {
        dataService = new DataService();
    }
    
    @Test
    @DisplayName("Test JSON creation contains expected fields")
    void testCreateJsonData() {
        String json = dataService.createJsonData("Test", 42);
        
        assertNotNull(json);
        assertTrue(json.contains("\"name\":\"Test\""));
        assertTrue(json.contains("\"value\":42"));
        assertTrue(json.contains("timestamp"));
    }
    
    @Test
    @DisplayName("Test text processing")
    void testProcessText() {
        String result = dataService.processText("hello world");
        assertNotNull(result);
        assertFalse(result.isEmpty());
    }
    
    @Test
    @DisplayName("Test empty input returns empty string")
    void testProcessTextEmpty() {
        assertEquals("", dataService.processText(""));
        assertEquals("", dataService.processText(null));
    }
    
    @Test
    @DisplayName("Test input validation")
    void testIsValidInput() {
        assertTrue(dataService.isValidInput("valid text"));
        assertFalse(dataService.isValidInput(""));
        assertFalse(dataService.isValidInput("   "));
        assertFalse(dataService.isValidInput(null));
    }
}
