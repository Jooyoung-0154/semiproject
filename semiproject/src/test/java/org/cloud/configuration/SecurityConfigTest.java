package org.cloud.configuration;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;

class SecurityConfigTest {

    private final SecurityConfig securityConfig = new SecurityConfig(new ObjectMapper());

    @Test
    void authenticationManagerIsProvidedBySpringSecurityConfiguration() throws Exception {
        AuthenticationConfiguration authenticationConfiguration =
                mock(AuthenticationConfiguration.class);
        AuthenticationManager expectedManager = mock(AuthenticationManager.class);
        when(authenticationConfiguration.getAuthenticationManager())
                .thenReturn(expectedManager);

        AuthenticationManager authenticationManager =
                securityConfig.authenticationManager(authenticationConfiguration);

        assertThat(authenticationManager).isSameAs(expectedManager);
    }

    @Test
    void securityContextIsStoredInHttpSession() {
        SecurityContextRepository repository =
                securityConfig.securityContextRepository();

        assertThat(repository)
                .isInstanceOf(HttpSessionSecurityContextRepository.class);
    }
}
