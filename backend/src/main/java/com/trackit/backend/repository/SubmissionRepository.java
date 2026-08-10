package com.trackit.backend.repository;

import com.trackit.backend.model.Submission;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubmissionRepository
        extends MongoRepository<Submission, String> {

    List<Submission> findByTaskId(String taskId);

    List<Submission> findByInternId(String internId);
}