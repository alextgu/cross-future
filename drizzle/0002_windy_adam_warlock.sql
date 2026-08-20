PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_interviews` (
	`code` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`person_slug` text NOT NULL,
	`duration_min` integer NOT NULL,
	`featured` integer NOT NULL,
	`pull_quote` text,
	`image` text,
	`url` text,
	`edition_year` integer,
	`topics` text,
	FOREIGN KEY (`person_slug`) REFERENCES `people`(`slug`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_interviews` (
	`code`,
	`slug`,
	`title`,
	`person_slug`,
	`duration_min`,
	`featured`,
	`pull_quote`,
	`image`,
	`url`,
	`edition_year`,
	`topics`
)
SELECT
	`code`,
	`person_slug` || '-' || lower(replace(`code`, '.', '-')),
	`title`,
	`person_slug`,
	`duration_min`,
	`featured`,
	`pull_quote`,
	`image`,
	`url`,
	NULL,
	NULL
FROM `interviews`;--> statement-breakpoint
DROP TABLE `interviews`;--> statement-breakpoint
ALTER TABLE `__new_interviews` RENAME TO `interviews`;--> statement-breakpoint
CREATE UNIQUE INDEX `interviews_slug_unique` ON `interviews` (`slug`);--> statement-breakpoint
PRAGMA foreign_keys=ON;
