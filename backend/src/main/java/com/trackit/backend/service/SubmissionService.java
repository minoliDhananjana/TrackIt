package com.trackit.backend.service;

import com.trackit.backend.enums.Status;
import com.trackit.backend.enums.SubmissionStatus;
import com.trackit.backend.model.Submission;
import com.trackit.backend.model.Task;
import com.trackit.backend.repository.SubmissionRepository;
import com.trackit.backend.repository.TaskRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.time.LocalDateTime;
import org.springframework.security.access.AccessDeniedException;

@Service
public class SubmissionService {

    private final SubmissionRepository submissionRepository;
    private final TaskRepository taskRepository;

    public SubmissionService(
            SubmissionRepository submissionRepository,
            TaskRepository taskRepository
    ) {
        this.submissionRepository = submissionRepository;
        this.taskRepository = taskRepository;
    }

    public Submission createSubmission(Submission submission, String internId) {
        Task task = taskRepository
                .findById(submission.getTaskId())
                .orElseThrow(() -> new IllegalArgumentException("Selected task does not exist"));

        if (!internId.equals(task.getAssignedInternId())) {
            throw new AccessDeniedException("You can only submit work for tasks assigned to you");
        }
        if (task.getStatus() == Status.COMPLETED || task.getStatus() == Status.SUBMITTED) {
            throw new IllegalArgumentException("This task is already completed or awaiting review");
        }

        submission.setInternId(internId);
        submission.setApproved(false);
        submission.setReviewStatus(SubmissionStatus.PENDING);
        submission.setSupervisorComment(null);
        submission.setSubmittedAt(LocalDateTime.now());
        submission.setReviewedAt(null);

        Submission savedSubmission = submissionRepository.save(submission);

        task.setStatus(Status.SUBMITTED);
        taskRepository.save(task);

        return savedSubmission;
    }

    public List<Submission> getAllSubmissions() {
        return submissionRepository.findAll();
    }

    public List<Submission> getVisibleSubmissions(String internId, boolean supervisor) {
        return supervisor ? submissionRepository.findAll() : submissionRepository.findByInternId(internId);
    }

    public List<Submission> getSubmissionsByTask(String taskId) {
        return submissionRepository.findByTaskId(taskId);
    }

    public List<Submission> getVisibleSubmissionsByTask(String taskId, String userId, boolean supervisor) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new java.util.NoSuchElementException("Task not found"));
        if (!supervisor && !userId.equals(task.getAssignedInternId())) {
            throw new AccessDeniedException("You can only view submissions for your tasks");
        }
        return submissionRepository.findByTaskId(taskId);
    }

    public Submission reviewSubmission(
            String id,
            String comment,
            boolean approved
    ) {
        if (!approved && (comment == null || comment.isBlank())) {
            throw new IllegalArgumentException("A revision comment is required when requesting changes");
        }
        Submission submission =
                submissionRepository.findById(id).orElse(null);

        if (submission == null) {
            return null;
        }

        submission.setSupervisorComment(comment);
        submission.setApproved(approved);
        submission.setReviewStatus(approved ? SubmissionStatus.APPROVED : SubmissionStatus.REVISION_REQUIRED);
        submission.setReviewedAt(LocalDateTime.now());

        Task task = taskRepository
                .findById(submission.getTaskId())
                .orElse(null);

        if (task != null) {
            if (approved) {
                task.setStatus(Status.COMPLETED);
                task.setProgress(100);
            } else {
                task.setStatus(Status.REVISION_REQUIRED);
            }

            taskRepository.save(task);
        }

        return submissionRepository.save(submission);
    }
}
