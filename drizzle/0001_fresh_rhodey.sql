CREATE TABLE "battle_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"opponent_id" text NOT NULL,
	"opponent_name" text NOT NULL,
	"opponent_is_bot" boolean DEFAULT false NOT NULL,
	"result" text NOT NULL,
	"player_power" integer NOT NULL,
	"opponent_power" integer NOT NULL,
	"battle_data" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "battle_logs" ADD CONSTRAINT "battle_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;