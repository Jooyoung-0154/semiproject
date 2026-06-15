package org.cloud.control;

import java.util.Map;

import org.cloud.service.GeminiService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
public class AiController {
    private final GeminiService geminiService;

    public AiController(GeminiService geminiService) {
        this.geminiService = geminiService;
    }

    @PostMapping("/chat")
    public ResponseEntity<String> chat(@RequestBody Map<String, String> request) {
        try {
            String result = geminiService.getAiResponse(request.get("prompt"));
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(503).body("{\"error\":\"" + e.getMessage().replace("\"", "'") + "\"}");
        }
    }
}
