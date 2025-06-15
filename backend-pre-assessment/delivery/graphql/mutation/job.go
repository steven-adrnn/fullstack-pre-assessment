package mutation

import (
	"context"
	_dataloader "jobqueue/delivery/graphql/dataloader"
	"jobqueue/delivery/graphql/resolver"
	_interface "jobqueue/interface"
)

type JobMutation struct {
	jobService _interface.JobService
	dataloader *_dataloader.GeneralDataloader
}

func (q JobMutation) Enqueue(ctx context.Context, args struct{ Task string }) (*resolver.JobResolver, error) {
	id, err := q.jobService.Enqueue(ctx, args.Task)
	if err != nil {
		return nil, err
	}
	job, err := q.jobService.GetJobById(ctx, id)
	if err != nil {
		return nil, err
	}
	return &resolver.JobResolver{
		Data:       *job,
		JobService: q.jobService,
		Dataloader: q.dataloader,
	}, nil
}

func (q JobMutation) SimultaneousCreateJob(ctx context.Context, args struct {
	Job1 string
	Job2 string
	Job3 string
}) (*struct {
	Job1 *resolver.JobResolver
	Job2 *resolver.JobResolver
	Job3 *resolver.JobResolver
}, error) {
	job1ID, err := q.jobService.Enqueue(ctx, args.Job1)
	if err != nil {
		return nil, err
	}
	job2ID, err := q.jobService.Enqueue(ctx, args.Job2)
	if err != nil {
		return nil, err
	}
	job3ID, err := q.jobService.Enqueue(ctx, args.Job3)
	if err != nil {
		return nil, err
	}

	job1, err := q.jobService.GetJobById(ctx, job1ID)
	if err != nil {
		return nil, err
	}
	job2, err := q.jobService.GetJobById(ctx, job2ID)
	if err != nil {
		return nil, err
	}
	job3, err := q.jobService.GetJobById(ctx, job3ID)
	if err != nil {
		return nil, err
	}

	return &struct {
		Job1 *resolver.JobResolver
		Job2 *resolver.JobResolver
		Job3 *resolver.JobResolver
	}{
		Job1: &resolver.JobResolver{Data: *job1, JobService: q.jobService, Dataloader: q.dataloader},
		Job2: &resolver.JobResolver{Data: *job2, JobService: q.jobService, Dataloader: q.dataloader},
		Job3: &resolver.JobResolver{Data: *job3, JobService: q.jobService, Dataloader: q.dataloader},
	}, nil
}

func (q JobMutation) SimulateUnstableJob(ctx context.Context) (*resolver.JobResolver, error) {
	id, err := q.jobService.Enqueue(ctx, "unstable-job")
	if err != nil {
		return nil, err
	}
	job, err := q.jobService.GetJobById(ctx, id)
	if err != nil {
		return nil, err
	}
	return &resolver.JobResolver{
		Data:       *job,
		JobService: q.jobService,
		Dataloader: q.dataloader,
	}, nil
}

// NewJobMutation to create new instance
func NewJobMutation(jobService _interface.JobService, dataloader *_dataloader.GeneralDataloader) JobMutation {
	return JobMutation{
		jobService: jobService,
		dataloader: dataloader,
	}
}
