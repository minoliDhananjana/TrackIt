package com.trackit.backend.controller;

import com.trackit.backend.dto.DashboardResponse;
import com.trackit.backend.service.DashboardService;
import com.trackit.backend.service.CurrentUserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(originPatterns = {"http://localhost:*", "http://127.0.0.1:*"})
public class DashboardController {

    private final DashboardService dashboardService;
    private final CurrentUserService currentUserService;

    public DashboardController(DashboardService dashboardService, CurrentUserService currentUserService) {
        this.dashboardService = dashboardService;
        this.currentUserService = currentUserService;
    }

    @GetMapping
    public ResponseEntity<DashboardResponse> getDashboardSummary() {
        var user = currentUserService.requireCurrentUser();
        return ResponseEntity.ok(dashboardService.getDashboardSummary(user, currentUserService.isSupervisor(user)));
    }
}
