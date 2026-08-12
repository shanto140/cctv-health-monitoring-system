-- ============================================================================
-- CCTV HEALTH MONITORING SYSTEM — DATABASE SCHEMA (MySQL)
-- Course: SWE 0610-3250
-- Run this directly in MySQL Workbench.
-- ============================================================================

CREATE DATABASE IF NOT EXISTS cctv_health_monitoring_system;
USE cctv_health_monitoring_system;


-- ----------------------------------------------------------------------------
-- TABLE: cameras
-- প্রতিটা registered CCTV camera-র তথ্য এবং তার বর্তমান health status রাখে।
-- stream_url এর ভিতরেই RTSP credential embedded থাকে (rtsp://user:pass@ip:port/path)
-- ----------------------------------------------------------------------------
CREATE TABLE cameras (
    id                  INT PRIMARY KEY AUTO_INCREMENT,
    name                VARCHAR(100) NOT NULL,
    location            VARCHAR(255) NOT NULL,
    ip_address          VARCHAR(50),
    stream_url          VARCHAR(500) NOT NULL,
    current_status      ENUM('Online', 'Offline', 'Degraded') DEFAULT 'Offline',
    status_updated_at   DATETIME,
    is_active           BOOLEAN DEFAULT TRUE,
    created_at          DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;


-- ----------------------------------------------------------------------------
-- TABLE: camera_issues
-- Camera-তে automated health-check/blur/obstruction detection যখন কোনো
-- সমস্যা ধরে, তার record রাখে। এটাই camera-র problem history।
-- ----------------------------------------------------------------------------
CREATE TABLE camera_issues (
    id            INT PRIMARY KEY AUTO_INCREMENT,
    camera_id     INT NOT NULL,
    issue_type    ENUM('Offline', 'Blur', 'Obstruction') NOT NULL,
    status        ENUM('active', 'linked', 'resolved') DEFAULT 'active',
    detected_at   DATETIME NOT NULL,
    resolved_at   DATETIME,
    CONSTRAINT fk_issue_camera FOREIGN KEY (camera_id) REFERENCES cameras(id)
) ENGINE=InnoDB;


-- ----------------------------------------------------------------------------
-- TABLE: admins
-- Admin user-দের identity ও login credential রাখে।
-- reset_token: forgot-password flow-এর জন্য
-- refresh_token: JWT refresh token সংরক্ষণের জন্য (logout করলে invalidate করা যাবে)
-- ----------------------------------------------------------------------------
CREATE TABLE admins (
    id                     INT PRIMARY KEY AUTO_INCREMENT,
    name                   VARCHAR(100) NOT NULL,
    email                  VARCHAR(150) UNIQUE NOT NULL,
    phone                  VARCHAR(20),
    password               VARCHAR(255) NOT NULL,
    profile_image          VARCHAR(255),
    reset_token            VARCHAR(255) DEFAULT NULL,
    reset_token_expires    DATETIME DEFAULT NULL,
    refresh_token          VARCHAR(500) DEFAULT NULL,
    is_active              BOOLEAN DEFAULT TRUE,
    created_at             DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;


-- ----------------------------------------------------------------------------
-- TABLE: technicians
-- Technician user-দের identity ও login credential রাখে। Busy/Available
-- status বা task count এখানে store করা হয় না — incidents টেবিল থেকে
-- সবসময় হিসাব করে বের করা হবে। Account শুধু Admin-ই তৈরি করতে পারবে।
-- ----------------------------------------------------------------------------
CREATE TABLE technicians (
    id                     INT PRIMARY KEY AUTO_INCREMENT,
    name                   VARCHAR(100) NOT NULL,
    email                  VARCHAR(150) UNIQUE NOT NULL,
    phone                  VARCHAR(20),
    password               VARCHAR(255) NOT NULL,
    profile_image          VARCHAR(255),
    reset_token            VARCHAR(255) DEFAULT NULL,
    reset_token_expires    DATETIME DEFAULT NULL,
    refresh_token          VARCHAR(500) DEFAULT NULL,
    is_active              BOOLEAN DEFAULT TRUE,
    created_at             DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;


-- ----------------------------------------------------------------------------
-- TABLE: notifications
-- সিস্টেমের ঘটনা (নতুন issue, assign, reject, complete) সংশ্লিষ্ট
-- Admin/Technician-কে জানানোর record রাখে, realtime socket ছাড়াও।
-- ----------------------------------------------------------------------------
CREATE TABLE notifications (
    id              INT PRIMARY KEY AUTO_INCREMENT,
    receiver_id     INT NOT NULL,
    receiver_role   ENUM('Admin', 'Technician') NOT NULL,
    message         VARCHAR(255) NOT NULL,
    is_read         BOOLEAN DEFAULT FALSE,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;


-- ----------------------------------------------------------------------------
-- TABLE: incidents
-- পুরা incident lifecycle এই একটা টেবিলে ট্র্যাক হয় — Open থেকে
-- Assigned → In Progress → Completed/Rejected পর্যন্ত সব state এখানে।
-- ----------------------------------------------------------------------------
CREATE TABLE incidents (
    id                       INT PRIMARY KEY AUTO_INCREMENT,
    camera_id                INT NOT NULL,
    camera_issue_id          INT,
    status                   ENUM('Open', 'Assigned', 'In Progress', 'Rejected', 'Completed') DEFAULT 'Open',
    priority                 ENUM('High', 'Medium', 'Low') DEFAULT 'Medium',
    description              TEXT,
    assigned_technician_id   INT,
    remarks                  TEXT,
    created_at               DATETIME DEFAULT CURRENT_TIMESTAMP,
    assigned_at              DATETIME,
    completed_at             DATETIME,
    CONSTRAINT fk_incident_camera FOREIGN KEY (camera_id) REFERENCES cameras(id),
    CONSTRAINT fk_incident_issue FOREIGN KEY (camera_issue_id) REFERENCES camera_issues(id),
    CONSTRAINT fk_incident_technician FOREIGN KEY (assigned_technician_id) REFERENCES technicians(id)
) ENGINE=InnoDB;


CREATE INDEX idx_incident_status ON incidents(status);
CREATE INDEX idx_incident_technician ON incidents(assigned_technician_id);
CREATE INDEX idx_issue_camera_status ON camera_issues(camera_id, status);
CREATE INDEX idx_notification_recipient ON notifications(recipient_id, recipient_role);