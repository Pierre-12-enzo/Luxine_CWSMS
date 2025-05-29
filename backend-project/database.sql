CREATE DATABASE IF NOT EXISTS CWSMS;
USE CWSMS;

DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS servicePackages;
DROP TABLE IF EXISTS cars;
DROP TABLE IF EXISTS packages;
DROP TABLE IF EXISTS users;

CREATE TABLE IF NOT EXISTS packages (
    PackageNumber INT AUTO_INCREMENT PRIMARY KEY,
    PackageName VARCHAR(100) NOT NULL,
    PackageDescription VARCHAR(255) NOT NULL,
    PackagePrice DECIMAL(10, 2) NOT NULL
);

CREATE TABLE IF NOT EXISTS cars (
    PlateNumber VARCHAR(20) PRIMARY KEY,
    CarType VARCHAR(50) NOT NULL,
    CarSize VARCHAR(50) NOT NULL,
    DriverName VARCHAR(100) NOT NULL,
    PhoneNumber VARCHAR(20) NOT NULL
);

CREATE TABLE IF NOT EXISTS servicePackages (
    RecordNumber INT AUTO_INCREMENT PRIMARY KEY,
    ServiceDate DATE NOT NULL,
    PlateNumber VARCHAR(20) NOT NULL,
    PackageNumber INT NOT NULL,
    FOREIGN KEY (PlateNumber) REFERENCES cars(PlateNumber) ON DELETE CASCADE,
    FOREIGN KEY (PackageNumber) REFERENCES packages(PackageNumber) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS payments (
    PaymentNumber INT AUTO_INCREMENT PRIMARY KEY,
    AmountPaid DECIMAL(10, 2) NOT NULL,
    PaymentDate DATE NOT NULL,
    RecordNumber INT NOT NULL,
    FOREIGN KEY (RecordNumber) REFERENCES servicePackages(RecordNumber) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS users (
    UserID INT AUTO_INCREMENT PRIMARY KEY,
    Username VARCHAR(50) NOT NULL UNIQUE,
    Password VARCHAR(255) NOT NULL,
    FullName VARCHAR(100) NOT NULL
);

INSERT INTO packages (PackageName, PackageDescription, PackagePrice)
VALUES ('Basic wash', 'Exterior hand wash', 5000);

INSERT INTO packages (PackageName, PackageDescription, PackagePrice)
VALUES ('Premium wash', 'Full exterior and interior cleaning', 12000);

INSERT INTO packages (PackageName, PackageDescription, PackagePrice)
VALUES ('Deluxe wash', 'Complete car detailing service', 20000);

INSERT INTO users (Username, Password, FullName)
VALUES ('admin', 'admin123', 'Administrator');

