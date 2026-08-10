package com.trackit.backend.service;

import com.trackit.backend.model.WorkLog;
import com.trackit.backend.repository.WorkLogRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WorkLogService {

    private final WorkLogRepository workLogRepository;

    public WorkLogService(WorkLogRepository workLogRepository) {
        this.workLogRepository = workLogRepository;
    }

    public WorkLog createWorkLog(WorkLog workLog) {
        if (workLog.getDate().isAfter(java.time.LocalDate.now())) {
            throw new IllegalArgumentException("Work log date cannot be in the future");
        }
        if (workLogRepository.existsByInternIdAndDate(workLog.getInternId(), workLog.getDate())) {
            throw new IllegalArgumentException("You have already submitted a work log for this date");
        }
        return workLogRepository.save(workLog);
    }

    public List<WorkLog> getAllWorkLogs() {
        return workLogRepository.findAll();
    }

    public List<WorkLog> getVisibleWorkLogs(String internId, boolean supervisor) {
        return supervisor ? workLogRepository.findAll() : workLogRepository.findByInternId(internId);
    }

    public List<WorkLog> getWorkLogsByIntern(String internId) {
        return workLogRepository.findByInternId(internId);
    }

    public WorkLog addSupervisorFeedback(
            String id,
            String feedback
    ) {
        if (feedback == null || feedback.isBlank()) {
            throw new IllegalArgumentException("Feedback is required");
        }
        WorkLog existingWorkLog =
                workLogRepository.findById(id).orElse(null);

        if (existingWorkLog == null) {
            return null;
        }

        existingWorkLog.setSupervisorFeedback(feedback.trim());

        return workLogRepository.save(existingWorkLog);
    }
}
