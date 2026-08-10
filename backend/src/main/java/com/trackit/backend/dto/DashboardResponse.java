package com.trackit.backend.dto;

import com.trackit.backend.model.Submission;

import java.util.List;

public class DashboardResponse {

    private long activeInterns;
    private long activeProjects;
    private long pendingTasks;
    private long completedTasks;
    private long overdueTasks;
    private List<Submission> recentActivity;

    public DashboardResponse(
            long activeInterns,
            long activeProjects,
            long pendingTasks,
            long completedTasks,
            long overdueTasks,
            List<Submission> recentActivity
    ) {
        this.activeInterns = activeInterns;
        this.activeProjects = activeProjects;
        this.pendingTasks = pendingTasks;
        this.completedTasks = completedTasks;
        this.overdueTasks = overdueTasks;
        this.recentActivity = recentActivity;
    }

    public long getActiveInterns() {
        return activeInterns;
    }

    public long getActiveProjects() {
        return activeProjects;
    }

    public long getPendingTasks() {
        return pendingTasks;
    }

    public long getCompletedTasks() {
        return completedTasks;
    }

    public long getOverdueTasks() {
        return overdueTasks;
    }

    public List<Submission> getRecentActivity() {
        return recentActivity;
    }
}