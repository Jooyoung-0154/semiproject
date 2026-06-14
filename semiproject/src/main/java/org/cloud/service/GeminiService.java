package org.cloud.service;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class GeminiService {
	@Value("${google.gemini.api.key}")
    private String apiKey;

    @Value("${google.gemini.model.url}")
    private String apiUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public String getAiResponse(String prompt) {
        String urlWithKey = apiUrl + "?key=" + apiKey;

        Map<String, Object> contents = Map.of("parts", List.of(Map.of("text", prompt)));
        Map<String, Object> body = Map.of("contents", List.of(contents));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(urlWithKey, entity, String.class);
            return response.getBody();
        } catch (Exception e) {
            throw new RuntimeException("Gemini API 호출 실패: " + e.getMessage(), e);
        }
    }
}
