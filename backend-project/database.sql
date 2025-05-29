CREATE DATABASE IF NOT EXISTS CWSMS;
USE CWSMS;


CREATE TABLE IF NOT EXISTS Packages (
    PackageNumber INT AUTO_INCREMENT PRIMARY KEY,
    PackageName VARCHAR(100) NOT NULL,
    PackageDescription VARCHAR(255) NOT NULL,
    PackagePrice DECIMAL(10, 2) NOT NULL
);


CREATE TABLE IF NOT EXISTS Cars (
    PlateNumber VARCHAR(20) PRIMARY KEY,
    CarType VARCHAR(50) NOT NULL,
    CarSize VARCHAR(50) NOT NULL,
    DriverName VARCHAR(100) NOT NULL,
    PhoneNumber VARCHAR(20) NOT NULL
);


CREATE TABLE IF NOT EXISTS ServicePackages (
    RecordNumber INT AUTO_INCREMENT PRIMARY KEY,
    ServiceDate DATE NOT NULL,
    PlateNumber VARCHAR(20) NOT NULL,
    PackageNumber INT NOT NULL,
    FOREIGN KEY (PlateNumber) REFERENCES Cars(PlateNumber),
    FOREIGN KEY (PackageNumber) REFERENCES Packages(PackageNumber)
);


CREATE TABLE IF NOT EXISTS Payments (
    PaymentNumber INT AUTO_INCREMENT PRIMARY KEY,
    AmountPaid DECIMAL(10, 2) NOT NULL,
    PaymentDate DATE NOT NULL,
    RecordNumber INT NOT NULL,
    FOREIGN KEY (RecordNumber) REFERENCES ServicePackages(RecordNumber)
);


CREATE TABLE IF NOT EXISTS Users (
    UserID INT AUTO_INCREMENT PRIMARY KEY,
    Username VARCHAR(50) NOT NULL UNIQUE,
    Password VARCHAR(255) NOT NULL,
    FullName VARCHAR(100) NOT NULL
);


INSERT INTO Packages (PackageName, PackageDescription, PackagePrice) 
VALUES ('Basic wash', 'Exterior hand wash', 5000);

INSERT INTO Users (Username, Password, FullName) 
VALUES ('admin', 'admin123', 'Administrator');

