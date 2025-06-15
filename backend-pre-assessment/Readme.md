# Simple Distributed Job Queue Simulation

This project is a simple distributed job queue system implemented in Go with a GraphQL API interface. It simulates job creation, processing, and status tracking with concurrency safety and retry logic.

## Features

- **Job Queue:** Enqueue jobs (tasks) to be processed asynchronously.
- **Concurrency Safety:** Supports multiple jobs created and processed simultaneously without data corruption or race conditions.
- **Job Status Tracking:** Tracks job statuses: pending, running, failed, completed.
- **Retry Logic:** Automatically retries failed jobs up to 3 times with delay.
- **Special Case Handling:** Simulates an "unstable-job" that fails twice before succeeding.
- **GraphQL API:** Provides GraphQL mutations and queries to interact with the job queue.
- **In-Memory Storage:** Uses thread-safe in-memory storage for jobs.
- **Logging and Graceful Failure:** Logs meaningful events and handles failures without crashing.

## Requirements

- Go 1.20 or higher

## How to Run

1. Open the project in VSCode.
2. Use the Go-Debug configuration to run the project.
3. The server listens on port 58579 by default.
4. Open your browser and navigate to [http://localhost:58579/graphiql](http://localhost:58579/graphiql) to access the GraphiQL interface.

## GraphQL API

### Mutations

- `SimultaneousCreateJob(Job1: String!, Job2: String!, Job3: String!): Jobs!` - Create three jobs simultaneously.
- `SimulateUnstableJob: Job!` - Create a special unstable job that fails twice before succeeding.

### Queries

- `Jobs: [Job!]!` - Retrieve all jobs.
- `Job(id: String!): Job` - Retrieve a job by ID.
- `JobStatus: JobStatus!` - Get counts of jobs by status (pending, running, failed, completed).

## Evaluation Criteria

- Correctness: Accurate job creation, execution, and status updates.
- Concurrency Safety: Safe concurrent job processing without race conditions.
- Idempotency: Prevents duplicate processing of the same job.
- Retry Logic: Retries failing jobs with delay.
- In-Memory Safety: Thread-safe use of maps and lists.
- Code Quality: Idiomatic Go, clean architecture, and naming.
- Performance: Handles 50-100 concurrent jobs without slowdown.
- Logging and Debugging: Meaningful logs for monitoring.
- Graceful Failure Handling: No panics; failures do not crash the system.
