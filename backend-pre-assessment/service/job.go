package service

import (
	"context"
	"errors"
	"fmt"
	"jobqueue/entity"
	_interface "jobqueue/interface"
	"log"
	"sync"
	"time"
)

type jobService struct {
	jobRepo             _interface.JobRepository
	mu                  sync.Mutex
	unstableJobFailures map[string]int
}

// Initiator ...
type Initiator func(s *jobService) *jobService

func (s *jobService) GetAllJobs(ctx context.Context) ([]*entity.Job, error) {
	return s.jobRepo.FindAll(ctx)
}

func (s *jobService) GetJobById(ctx context.Context, id string) (*entity.Job, error) {
	return s.jobRepo.FindByID(ctx, id)
}

func (s *jobService) GetAllJobStatus(ctx context.Context) (*entity.JobStatus, error) {
	jobs, err := s.jobRepo.FindAll(ctx)
	if err != nil {
		return nil, err
	}
	status := &entity.JobStatus{}
	for _, job := range jobs {
		switch job.Status {
		case "pending":
			status.Pending++
		case "running":
			status.Running++
		case "failed":
			status.Failed++
		case "completed":
			status.Completed++
		}
	}
	return status, nil
}

func (s *jobService) Enqueue(ctx context.Context, taskName string) (string, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	// Idempotency: check if job with same task already exists
	jobs, err := s.jobRepo.FindAll(ctx)
	if err != nil {
		return "", err
	}
	for _, job := range jobs {
		if job.Task == taskName && job.Status != "failed" && job.Status != "completed" {
			return job.ID, nil
		}
	}

	// Create new job
	job := &entity.Job{
		ID:       fmt.Sprintf("%d", time.Now().UnixNano()),
		Task:     taskName,
		Status:   "pending",
		Attempts: 0,
	}
	err = s.jobRepo.Save(ctx, job)
	if err != nil {
		return "", err
	}

	// Start processing job asynchronously
	go s.processJob(ctx, job)

	return job.ID, nil
}

func (s *jobService) processJob(ctx context.Context, job *entity.Job) {
	s.updateJobStatus(ctx, job, "running")

	maxRetries := int32(3)
	retryDelay := 1 * time.Second

	for {
		job.Attempts++
		err := s.executeTask(ctx, job)
		if err == nil {
			s.updateJobStatus(ctx, job, "completed")
			return
		}

		log.Printf("Job %s failed attempt %d: %v", job.ID, job.Attempts, err)
		if job.Attempts >= maxRetries {
			s.updateJobStatus(ctx, job, "failed")
			return
		}

		time.Sleep(retryDelay)
	}
}

func (s *jobService) executeTask(ctx context.Context, job *entity.Job) error {
	// Special case for unstable-job: fail twice before success
	if job.Task == "unstable-job" {
		s.mu.Lock()
		defer s.mu.Unlock()
		if s.unstableJobFailures == nil {
			s.unstableJobFailures = make(map[string]int)
		}
		failures := s.unstableJobFailures[job.ID]
		if failures < 2 {
			s.unstableJobFailures[job.ID] = failures + 1
			return errors.New("simulated failure for unstable-job")
		}
		return nil
	}

	// Simulate task execution time
	time.Sleep(500 * time.Millisecond)
	return nil
}

func (s *jobService) updateJobStatus(ctx context.Context, job *entity.Job, status string) {
	s.mu.Lock()
	defer s.mu.Unlock()
	job.Status = status
	err := s.jobRepo.Save(ctx, job)
	if err != nil {
		log.Printf("Failed to update job %s status: %v", job.ID, err)
	}
}

// NewJobService ...
func NewJobService() Initiator {
	return func(s *jobService) *jobService {
		return s
	}
}

// SetJobRepository ...
func (i Initiator) SetJobRepository(jobRepository _interface.JobRepository) Initiator {
	return func(s *jobService) *jobService {
		i(s).jobRepo = jobRepository
		return s
	}
}

// Build ...
func (i Initiator) Build() _interface.JobService {
	return i(&jobService{})
}
