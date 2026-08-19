package com.trackit.backend.repository;

import com.trackit.backend.model.Submission;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface SubmissionRepository
        extends MongoRepository<Submission, String> {

    List<Submission> findByTaskId(String taskId);

    List<Submission> findByInternId(String internId);
}