package com.example.service;

import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

/**
 * Data Service
 * Demonstrates usage of external dependencies (Jackson, Apache Commons)
 */
public class DataService {
    private static final Logger logger = LoggerFactory.getLogger(DataService.class);
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    /**
     * Create JSON data using Jackson
     */
    public String createJsonData(String name, int value) {
        try {
            ObjectNode node = objectMapper.createObjectNode();
            node.put("name", name);
            node.put("value", value);
            node.put("timestamp", System.currentTimeMillis());
            return objectMapper.writeValueAsString(node);
        } catch (Exception e) {
            logger.error("Error creating JSON", e);
            return "{}";
        }
    }
    
    /**
     * Process text using Apache Commons Lang
     */
    public String processText(String input) {
        if (StringUtils.isEmpty(input)) {
            return "";
        }
        
        // Capitalize, reverse, and trim
        String capitalized = StringUtils.capitalize(input);
        String reversed = StringUtils.reverse(capitalized);
        return StringUtils.trim(reversed);
    }
    
    /**
     * Validate input
     */
    public boolean isValidInput(String input) {
        return StringUtils.isNotBlank(input);
    }
}
