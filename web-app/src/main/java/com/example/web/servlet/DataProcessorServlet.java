package com.example.web.servlet;

import com.example.service.DataService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * Data Processor Servlet
 * Demonstrates using DataService from java-app module
 */
@WebServlet("/process")
public class DataProcessorServlet extends HttpServlet {
    private static final Logger logger = LoggerFactory.getLogger(DataProcessorServlet.class);
    private final DataService dataService = new DataService();
    
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        String text = request.getParameter("text");
        
        if (!dataService.isValidInput(text)) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"Invalid input\"}");
            return;
        }
        
        logger.info("Processing text: {}", text);
        
        String processed = dataService.processText(text);
        String jsonData = dataService.createJsonData(text, processed.length());
        
        response.setContentType("application/json");
        response.getWriter().write(jsonData);
    }
}
