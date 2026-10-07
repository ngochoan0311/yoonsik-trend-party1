CREATE TABLE "participants" (
	"id" serial PRIMARY KEY,
	"name" text NOT NULL,
	"twitter" text NOT NULL,
	"instagram" text NOT NULL,
	"ga_number" integer NOT NULL UNIQUE,
	"created_at" timestamp DEFAULT now() NOT NULL
);
