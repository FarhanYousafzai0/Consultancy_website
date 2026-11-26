# Global Internships — Deep Task Plan

## Execution order

DTM-0001 data foundation -> DTM-0002 normalization/status -> DTM-0003 source pipeline -> DTM-0004 automation -> DTM-0005 admin -> DTM-0006 public directory -> DTM-0007 quality/release -> final integration review.

Only one agent runs at a time. The parent reviews and verifies each task before dispatching the next.

## Integration rules

- Keep changes on the current branch.
- Prefer one focused commit per task, but never rewrite or reset unrelated history.
- New files should use existing project conventions and aliases.
- Shared helper extraction requires characterization tests first.
- Every task must leave the repository buildable and existing scholarship tests passing.

## Final deliverables

- Verified internship data layer and pipeline.
- Daily/manual research workflow.
- Admin review workflow.
- Public `/internships` directory and API.
- Tests, build verification, and final short implementation summary.
