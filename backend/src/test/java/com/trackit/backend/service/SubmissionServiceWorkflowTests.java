package com.trackit.backend.service;

import com.trackit.backend.enums.Status;
import com.trackit.backend.enums.SubmissionStatus;
import com.trackit.backend.model.Submission;
import com.trackit.backend.model.Task;
import com.trackit.backend.repository.SubmissionRepository;
import com.trackit.backend.repository.TaskRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SubmissionServiceWorkflowTests {
    @Mock SubmissionRepository submissionRepository;
    @Mock TaskRepository taskRepository;
    @InjectMocks SubmissionService submissionService;

    @Test
    void submissionMovesAssignedTaskToSubmitted() {
        Task task = new Task();
        task.setId("task-1");
        task.setAssignedInternId("intern-1");
        task.setStatus(Status.IN_PROGRESS);
        Submission submission = new Submission();
        submission.setTaskId("task-1");
        submission.setCompletionNote("Ready for review");
        when(taskRepository.findById("task-1")).thenReturn(Optional.of(task));
        when(submissionRepository.save(submission)).thenReturn(submission);

        Submission saved = submissionService.createSubmission(submission, "intern-1");

        assertEquals("intern-1", saved.getInternId());
        assertEquals(SubmissionStatus.PENDING, saved.getReviewStatus());
        assertEquals(Status.SUBMITTED, task.getStatus());
        verify(taskRepository).save(task);
    }

    @Test
    void internCannotSubmitAnotherInternsTask() {
        Task task = new Task();
        task.setAssignedInternId("intern-2");
        Submission submission = new Submission();
        submission.setTaskId("task-1");
        when(taskRepository.findById("task-1")).thenReturn(Optional.of(task));

        assertThrows(
                AccessDeniedException.class,
                () -> submissionService.createSubmission(submission, "intern-1")
        );
        verify(submissionRepository, never()).save(any());
    }

    @Test
    void approvalCompletesTaskAndRecordsReviewState() {
        Task task = new Task();
        task.setId("task-1");
        task.setStatus(Status.SUBMITTED);
        Submission submission = new Submission();
        submission.setId("submission-1");
        submission.setTaskId("task-1");
        when(submissionRepository.findById("submission-1")).thenReturn(Optional.of(submission));
        when(taskRepository.findById("task-1")).thenReturn(Optional.of(task));
        when(submissionRepository.save(submission)).thenReturn(submission);

        Submission reviewed = submissionService.reviewSubmission("submission-1", "Good work", true);

        assertTrue(reviewed.isApproved());
        assertEquals(SubmissionStatus.APPROVED, reviewed.getReviewStatus());
        assertNotNull(reviewed.getReviewedAt());
        assertEquals(Status.COMPLETED, task.getStatus());
        assertEquals(100, task.getProgress());
    }
}
