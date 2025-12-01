package com.example.web.servlet;

import com.example.service.CalculatorService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * Calculator Servlet
 * Demonstrates web application using shared java-app module
 */
@WebServlet("/calculate")
public class CalculatorServlet extends HttpServlet {
    private static final Logger logger = LoggerFactory.getLogger(CalculatorServlet.class);
    private final CalculatorService calculatorService = new CalculatorService();
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        try {
            String operation = request.getParameter("op");
            int num1 = Integer.parseInt(request.getParameter("num1"));
            int num2 = Integer.parseInt(request.getParameter("num2"));
            
            logger.info("Received request: {} {} {}", num1, operation, num2);
            
            double result = 0;
            
            switch (operation) {
                case "add":
                    result = calculatorService.add(num1, num2);
                    break;
                case "subtract":
                    result = calculatorService.subtract(num1, num2);
                    break;
                case "multiply":
                    result = calculatorService.multiply(num1, num2);
                    break;
                case "divide":
                    result = calculatorService.divide(num1, num2);
                    break;
                default:
                    response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                    response.getWriter().write("{\"error\":\"Invalid operation\"}");
                    return;
            }
            
            // Return JSON response
            response.setContentType("application/json");
            ObjectNode jsonResponse = objectMapper.createObjectNode();
            jsonResponse.put("num1", num1);
            jsonResponse.put("num2", num2);
            jsonResponse.put("operation", operation);
            jsonResponse.put("result", result);
            
            response.getWriter().write(objectMapper.writeValueAsString(jsonResponse));
            
        } catch (NumberFormatException e) {
            logger.error("Invalid number format", e);
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().write("{\"error\":\"Invalid number format\"}");
        } catch (IllegalArgumentException e) {
            logger.error("Calculation error", e);
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().write("{\"error\":\"" + e.getMessage() + "\"}");
        }
    }
}
