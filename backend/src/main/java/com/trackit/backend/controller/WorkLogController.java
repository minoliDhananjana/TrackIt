package com.trackit.backend.controller;

import com.trackit.backend.model.WorkLog;
import com.trackit.backend.service.WorkLogService;
import com.trackit.backend.service.CurrentUserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/worklogs")
@CrossOrigin(originPatterns = {"http://localhost:*", "http://127.0.0.1:*"})
public class WorkLogController {

    private final WorkLogService workLogService;
    private final CurrentUserService currentUserService;

    public WorkLogController(WorkLogService workLogService, CurrentUserService currentUserService) {
        this.workLogService = workLogService;
        this.currentUserService = currentUserService;
    }

    @PostMapping
    public ResponseEntity<WorkLog> createWorkLog(
            @Valid @RequestBody WorkLog workLog
    ) {
        var user = currentUserService.requireCurrentUser();
        workLog.setInternId(user.getId());
        return ResponseEntity.ok(
                workLogService.createWorkLog(workLog)
        );
    }

    @GetMapping
    public ResponseEntity<List<WorkLog>> getAllWorkLogs() {
        var user = currentUserService.requireCurrentUser();
        return ResponseEntity.ok(workLogService.getVisibleWorkLogs(user.getId(), currentUserService.isSupervisor(user)));
    }

    @GetMapping("/intern/{internId}")
    public ResponseEntity<List<WorkLog>> getWorkLogsByIntern(
            @PathVariable String internId
    ) {
        var user = currentUserService.requireCurrentUser();
        if (!currentUserService.isSupervisor(user) && !user.getId().equals(internId)) {
            throw new org.springframework.security.access.AccessDeniedException("You can only view your own work logs");
        }
        return ResponseEntity.ok(
                workLogService.getWorkLogsByIntern(internId)
        );
    }

    @PutMapping("/{id}/feedback")
    public ResponseEntity<?> addSupervisorFeedback(
            @PathVariable String id,
            @RequestBody Map<String, String> request
    ) {
        WorkLog updatedWorkLog =
                workLogService.addSupervisorFeedback(
                        id,
                        request.get("feedback")
                );

        if (updatedWorkLog == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(updatedWorkLog);
    }
}
