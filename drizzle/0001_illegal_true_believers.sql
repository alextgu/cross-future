PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_contact_inquiries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`edition_slug` text NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`email` text NOT NULL,
	`inquiry` text NOT NULL,
	`message` text NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`edition_slug`) REFERENCES `editions`(`slug`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
INSERT INTO `__new_contact_inquiries`("id", "edition_slug", "first_name", "last_name", "email", "inquiry", "message", "status", "created_at") SELECT "id", "edition_slug", "first_name", "last_name", "email", "inquiry", "message", "status", "created_at" FROM `contact_inquiries`;--> statement-breakpoint
DROP TABLE `contact_inquiries`;--> statement-breakpoint
ALTER TABLE `__new_contact_inquiries` RENAME TO `contact_inquiries`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `contact_edition_idx` ON `contact_inquiries` (`edition_slug`);--> statement-breakpoint
CREATE INDEX `contact_email_idx` ON `contact_inquiries` (`email`);--> statement-breakpoint
CREATE INDEX `contact_created_idx` ON `contact_inquiries` (`created_at`);--> statement-breakpoint
CREATE TABLE `__new_registrations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`edition_slug` text NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`email` text NOT NULL,
	`organization` text DEFAULT '' NOT NULL,
	`closest` text NOT NULL,
	`access` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`edition_slug`) REFERENCES `editions`(`slug`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
INSERT INTO `__new_registrations`("id", "edition_slug", "first_name", "last_name", "email", "organization", "closest", "access", "status", "created_at") SELECT "id", "edition_slug", "first_name", "last_name", "email", "organization", "closest", "access", "status", "created_at" FROM `registrations`;--> statement-breakpoint
DROP TABLE `registrations`;--> statement-breakpoint
ALTER TABLE `__new_registrations` RENAME TO `registrations`;--> statement-breakpoint
CREATE INDEX `registrations_edition_idx` ON `registrations` (`edition_slug`);--> statement-breakpoint
CREATE INDEX `registrations_email_idx` ON `registrations` (`email`);--> statement-breakpoint
CREATE INDEX `registrations_created_idx` ON `registrations` (`created_at`);