package com.trackit.backend.service;

import com.trackit.backend.dto.DashboardResponse;
import com.trackit.backend.enums.ProjectStatus;
import com.trackit.backend.enums.Role;
import com.trackit.backend.enums.Status;
import com.trackit.backend.model.Project;
import com.trackit.backend.model.Submission;
import com.trackit.backend.model.Task;
import com.trackit.backend.model.User;
import com.trackit.backend.repository.ProjectRepository;
import com.trackit.backend.repository.SubmissionRepository;
import com.trackit.backend.repository.TaskRepository;
import com.trackit.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;

@Service
public class DashboardService {

    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final SubmissionRepository submissionRepository;

    public DashboardService(
            UserRepository userRepository,
            ProjectRepository projectRepository,
            TaskRepository taskRepository,
            SubmissionRepository submissionRepository
    ) {
        this.userRepository = userRepository;
        this.projectRepository = projectRepository;
        this.taskRepository = taskRepository;
        this.submissionRepository = submissionRepository;
    }

    public DashboardResponse getDashboardSummary(User currentUser, boolean supervisor) {

        List<User> interns = supervisor ? userRepository.findByRole(Role.INTERN) : List.of(currentUser);
        long activeInterns = interns.stream()
                .filter(user -> user != null && user.isActive())
                .count();

        List<Project> visibleProjects = supervisor ? projectRepository.findAll() : projectRepository.findByAssignedInternIdsContaining(currentUser.getId());
        long activeProjects = visibleProjects.stream()
                .filter(project -> project.getStatus() == ProjectStatus.ACTIVE)
                .count();

        List<Task> tasks = supervisor ? taskRepository.findAll() : taskRepository.findByAssignedInternId(currentUser.getId());

        long pendingTasks = tasks.stream()
                .filter(task ->
                        task.getStatus() != Status.COMPLETED
                )
                .count();

        long completedTasks = tasks.stream()
                .filter(task ->
                        task.getStatus() == Status.COMPLETED
                )
                .count();

        long overdueTasks = tasks.stream()
                .filter(task ->
                        task.getDeadline() != null
                                && task.getDeadline().isBefore(LocalDate.now())
                                && task.getStatus() != Status.COMPLETED
                )
                .count();

        List<Submission> recentActivity =
                (supervisor ? submissionRepository.findAll() : submissionRepository.findByInternId(currentUser.getId())).stream()
                        .filter(Objects::nonNull)
                        .sorted(
                                Comparator.comparing(
                                        Submission::getSubmittedAt,
                                        Comparator.nullsLast(
                                                Comparator.naturalOrder()
                                        )
                                ).reversed()
                        )
                        .limit(5)
                        .toList();

        return new DashboardResponse(
                activeInterns,
                activeProjects,
                pendingTasks,
                completedTasks,
                overdueTasks,
                recentActivity
        );
    }
}
