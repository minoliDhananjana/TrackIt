package com.trackit.backend.dto;

import com.trackit.backend.enums.Status;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class TaskProgressRequest {
    @NotNull(message = "Status is required")
    private Status status;

    @Min(value = 0, message = "Progress cannot be below 0")
    @Max(value = 100, message = "Progress cannot exceed 100")
    private int progress;

    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }
    public int getProgress() { return progress; }
    public void setProgress(int progress) { this.progress = progress; }
}
