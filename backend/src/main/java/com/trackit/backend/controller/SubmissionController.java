package com.trackit.backend.controller;

import com.trackit.backend.model.Submission;
import com.trackit.backend.service.SubmissionService;
import com.trackit.backend.service.CurrentUserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/submissions")
@CrossOrigin(originPatterns = {"http://localhost:*", "http://127.0.0.1:*"})
public class SubmissionController {

    private final SubmissionService submissionService;
    private final CurrentUserService currentUserService;

    public SubmissionController(SubmissionService submissionService, CurrentUserService currentUserService) {
        this.submissionService = submissionService;
        this.currentUserService = currentUserService;
    }

    @PostMapping
    public ResponseEntity<Submission> createSubmission(
            @Valid @RequestBody Submission submission
    ) {
        var user = currentUserService.requireCurrentUser();
        return ResponseEntity.ok(
                submissionService.createSubmission(submission, user.getId())
        );
    }

    @GetMapping
    public ResponseEntity<List<Submission>> getAllSubmissions() {
        var user = currentUserService.requireCurrentUser();
        return ResponseEntity.ok(submissionService.getVisibleSubmissions(user.getId(), currentUserService.isSupervisor(user)));
    }

    @GetMapping("/task/{taskId}")
    public ResponseEntity<List<Submission>> getSubmissionsByTask(
            @PathVariable String taskId
    ) {
        var user = currentUserService.requireCurrentUser();
        return ResponseEntity.ok(
                submissionService.getVisibleSubmissionsByTask(taskId, user.getId(), currentUserService.isSupervisor(user))
        );
    }

    @PutMapping("/{id}/review")
    public ResponseEntity<?> reviewSubmission(
            @PathVariable String id,
            @RequestBody Map<String, Object> request
    ) {
        String comment = (String) request.get("comment");
        boolean approved = Boolean.TRUE.equals(request.get("approved"));

        Submission reviewedSubmission =
                submissionService.reviewSubmission(
                        id,
                        comment,
                        approved
                );

        if (reviewedSubmission == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(reviewedSubmission);
    }
}
