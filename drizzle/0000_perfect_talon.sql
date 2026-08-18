CREATE TABLE `appearances` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`person_slug` text NOT NULL,
	`edition_slug` text NOT NULL,
	`organizations` text NOT NULL,
	`role_title` text NOT NULL,
	`category` text NOT NULL,
	`billing` integer NOT NULL,
	`featured` integer NOT NULL,
	`thesis` text,
	FOREIGN KEY (`person_slug`) REFERENCES `people`(`slug`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`edition_slug`) REFERENCES `editions`(`slug`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `appearances_person_idx` ON `appearances` (`person_slug`);--> statement-breakpoint
CREATE INDEX `appearances_edition_idx` ON `appearances` (`edition_slug`);--> statement-breakpoint
CREATE INDEX `appearances_billing_idx` ON `appearances` (`billing`);--> statement-breakpoint
CREATE TABLE `contact_inquiries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`edition_slug` text NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`email` text NOT NULL,
	`inquiry` text NOT NULL,
	`message` text NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `contact_edition_idx` ON `contact_inquiries` (`edition_slug`);--> statement-breakpoint
CREATE INDEX `contact_email_idx` ON `contact_inquiries` (`email`);--> statement-breakpoint
CREATE INDEX `contact_created_idx` ON `contact_inquiries` (`created_at`);--> statement-breakpoint
CREATE TABLE `documents` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`type` text NOT NULL,
	`image` text NOT NULL,
	`issuer` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `editions` (
	`slug` text PRIMARY KEY NOT NULL,
	`year` integer NOT NULL,
	`name` text NOT NULL,
	`tagline` text NOT NULL,
	`thesis` text NOT NULL,
	`theme` text NOT NULL,
	`starts_at` text NOT NULL,
	`ends_at` text NOT NULL,
	`timezone` text NOT NULL,
	`venue` text NOT NULL,
	`registration_url` text NOT NULL,
	`status` text NOT NULL,
	`is_current` integer NOT NULL,
	`seo` text NOT NULL,
	`optional` text
);
--> statement-breakpoint
CREATE TABLE `interviews` (
	`code` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`person_slug` text NOT NULL,
	`duration_min` integer NOT NULL,
	`featured` integer NOT NULL,
	`pull_quote` text,
	`image` text,
	`url` text,
	FOREIGN KEY (`person_slug`) REFERENCES `people`(`slug`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `organizations` (
	`slug` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`short_name` text NOT NULL,
	`type` text NOT NULL,
	`url` text NOT NULL,
	`country` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `partners` (
	`slug` text PRIMARY KEY NOT NULL,
	`name` text,
	`logo` text NOT NULL,
	`url` text NOT NULL,
	`type` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `people` (
	`slug` text PRIMARY KEY NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`headshot` text NOT NULL,
	`links` text NOT NULL,
	`verified` integer NOT NULL,
	`bio` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `registrations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`edition_slug` text NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`email` text NOT NULL,
	`organization` text DEFAULT '' NOT NULL,
	`closest` text NOT NULL,
	`access` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `registrations_edition_idx` ON `registrations` (`edition_slug`);--> statement-breakpoint
CREATE INDEX `registrations_email_idx` ON `registrations` (`email`);--> statement-breakpoint
CREATE INDEX `registrations_created_idx` ON `registrations` (`created_at`);--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`edition_slug` text NOT NULL,
	`track_code` text NOT NULL,
	`starts_at` text NOT NULL,
	`ends_at` text NOT NULL,
	`room` text,
	`speakers` text NOT NULL,
	`status` text NOT NULL,
	`code` text,
	`category_label` text,
	`speaker_label` text,
	`description` text,
	`outcomes` text,
	FOREIGN KEY (`edition_slug`) REFERENCES `editions`(`slug`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`track_code`) REFERENCES `tracks`(`code`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `sessions_edition_idx` ON `sessions` (`edition_slug`);--> statement-breakpoint
CREATE INDEX `sessions_starts_idx` ON `sessions` (`starts_at`);--> statement-breakpoint
CREATE TABLE `site_content` (
	`edition_slug` text PRIMARY KEY NOT NULL,
	`assembly` text NOT NULL,
	`source_document` text NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`edition_slug`) REFERENCES `editions`(`slug`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `tracks` (
	`code` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`chain_stage` text NOT NULL
);
