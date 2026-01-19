-- Create provider_codes table if it doesn't exist
CREATE TABLE IF NOT EXISTS `provider_codes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `provider_id` int(11) NOT NULL,
  `item_id` varchar(255) NOT NULL,
  `provider_code` varchar(255) NOT NULL,
  `costs` JSON DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_provider_item` (`provider_id`, `item_id`),
  KEY `idx_provider_id` (`provider_id`),
  KEY `idx_item_id` (`item_id`),
  KEY `idx_provider_code` (`provider_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add foreign key constraints if the tables exist
-- ALTER TABLE `provider_codes` ADD CONSTRAINT `fk_provider_codes_provider` FOREIGN KEY (`provider_id`) REFERENCES `providers` (`id`) ON DELETE CASCADE;
-- ALTER TABLE `provider_codes` ADD CONSTRAINT `fk_provider_codes_item` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`) ON DELETE CASCADE;
