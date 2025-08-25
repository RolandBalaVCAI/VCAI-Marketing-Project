------Part 0-------
go through repository and remove anything not realted to MarketingManagerV4 and CampaignDetail
when done, git commit

------Part 1-------
We are going to go through a 3 step process to create a PLAN.md that has three major phases

Step 1 will be to scaffold the phases
Step 2 will be to understand each phase, and the current state of the project
Step 3 will be to create a list of tasks to accomplish the project


# Step 1:
## Phase 1 Mock the API

We need to refactor the application to improve it and break the data from the UI, i want to create a structure that follows this paradigm:

(Mocked data) -> Zustand -> UI

It needs to follow these principals:
1. Proper REST principals
2. One way data flow to avoid any possibility of react infinite reloading


## Phase 2 Build a professional front end application

1. No redundant code
2. DRY code
3. One way to handle errors of the following types
	1. api calls
	2. rendering errors (error boundaries)


## Phase 3 Document the API


1. Create a process that will scrape the mock api to generate a swagger or openapi file
2. Add an npm job to use that file to open a standalone redoc doc
3. Add an npm job to use orval to generate an SDK


# Step 2: Understand

Go through every single file in the application and understand the current state of application and what needs to be done. Focus on tasks that will refactor and consolidate to improve quality. we *need* to keep current existing functionality


# Step 3: Tasks

write an ordered list of task markdown files in in tasks/ that will take us from the current state of the app a refactored app that is well documented and follows standard DRY principals.
Each task should have a definable start and a definable end that can be user tested.






------Part 2-------
Perform each task in tasks/
After you are done with a task, rename it to be in-review-{task}.md, and pause to have me test
After I approve the task, move it to complete-{task}.md