package com.trackit.backend.service;

import com.trackit.backend.dto.TaskProgressRequest;
import com.trackit.backend.enums.Status;
import com.trackit.backend.model.Task;
import com.trackit.backend.repository.TaskRepository;
import com.trackit.backend.repository.ProjectRepository;
import com.trackit.backend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TaskServiceAuthorizationTests {
    @Mock TaskRepository taskRepository;
    @Mock ProjectRepository projectRepository;
    @Mock UserRepository userRepository;
    @InjectMocks TaskService taskService;

    @Test
    void assignedInternCanUpdateOnlyProgressFields() {
        Task task = new Task();
        task.setId("task-1");
        task.setAssignedInternId("intern-1");
        task.setTitle("Original title");
        TaskProgressRequest request = new TaskProgressRequest();
        request.setStatus(Status.IN_PROGRESS);
        request.setProgress(45);
        when(taskRepository.findById("task-1")).thenReturn(Optional.of(task));
        when(taskRepository.save(task)).thenReturn(task);

        Task updated = taskService.updateInternProgress("task-1", "intern-1", request);

        assertNotNull(updated);
        assertEquals(Status.IN_PROGRESS, updated.getStatus());
        assertEquals(45, updated.getProgress());
        assertEquals("Original title", updated.getTitle());
        verify(taskRepository).save(task);
    }

    @Test
    void internCannotUpdateAnotherInternsTask() {
        Task task = new Task();
        task.setAssignedInternId("intern-2");
        when(taskRepository.findById("task-1")).thenReturn(Optional.of(task));

        Task updated = taskService.updateInternProgress("task-1", "intern-1", new TaskProgressRequest());

        assertNull(updated);
        verify(taskRepository, never()).save(any());
    }

    @Test
    void internCannotMarkTaskSubmittedWithoutCreatingSubmission() {
        Task task = new Task();
        task.setAssignedInternId("intern-1");
        task.setStatus(Status.IN_PROGRESS);
        TaskProgressRequest request = new TaskProgressRequest();
        request.setStatus(Status.SUBMITTED);
        request.setProgress(100);
        when(taskRepository.findById("task-1")).thenReturn(Optional.of(task));

        IllegalArgumentException error = assertThrows(
                IllegalArgumentException.class,
                () -> taskService.updateInternProgress("task-1", "intern-1", request)
        );

        assertTrue(error.getMessage().contains("submit work"));
        verify(taskRepository, never()).save(any());
    }

    @Test
    void completedTaskCannotBeReopenedByIntern() {
        Task task = new Task();
        task.setAssignedInternId("intern-1");
        task.setStatus(Status.COMPLETED);
        TaskProgressRequest request = new TaskProgressRequest();
        request.setStatus(Status.IN_PROGRESS);
        request.setProgress(80);
        when(taskRepository.findById("task-1")).thenReturn(Optional.of(task));

        assertThrows(
                IllegalArgumentException.class,
                () -> taskService.updateInternProgress("task-1", "intern-1", request)
        );
        verify(taskRepository, never()).save(any());
    }
}
