# REASA attempt reset and result preservation fix

## Behaviour
- Every explicit quiz entry link clears only that puzzle's unfinished browser-side attempt (`reasa-quiz-<puzzleId>`).
- During an active attempt, answers and feedback continue to be saved in localStorage and restored on question URL navigation or refresh.
- Moving from one question to the next does not clear saved answers.
- The final result is still submitted to the existing `/api/attempts` endpoint. The server re-reads the published quiz and validates every selected option against the database before creating the completed Attempt and Answer records.
- Existing completed attempts and database schema/migrations are not changed.

## Entry points updated
- Homepage/category QuizGrid cards
- Homepage trending cards
- Daily challenge card
- Profile recent-quiz replay link

## Important
This patch does not change Prisma schema or migrations. Test the new-attempt flow and a complete multi-question result on staging before production deployment. A production build and live database test were not run in this environment.
