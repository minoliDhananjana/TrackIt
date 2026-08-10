package com.trackit.backend;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class BackendApplicationTests {

    @Test
    void applicationEntryPointCanBeCreatedWithoutExternalServices() {
        assertNotNull(new BackendApplication());
    }

}
