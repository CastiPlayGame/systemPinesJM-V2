-- Tabla para compras de proveedores
CREATE TABLE IF NOT EXISTS `provider_purchases` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `uuid` CHAR(36) NOT NULL UNIQUE,
    `provider_id` INT NOT NULL,
    `content` JSON NOT NULL COMMENT 'Contenido completo: provider y items con precios',
    `summary` JSON NOT NULL COMMENT 'Resumen de items: [{code:"GS-049", inship:false, shipped_amount:0}]',
    `status` ENUM('pending', 'shipped', 'received', 'completed') NOT NULL DEFAULT 'pending',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX `idx_provider_id` (`provider_id`),
    INDEX `idx_status` (`status`),
    INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
