-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 29, 2025 at 11:13 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `cwsms`
--

-- --------------------------------------------------------

--
-- Table structure for table `cars`
--

CREATE TABLE `cars` (
  `PlateNumber` varchar(20) NOT NULL,
  `CarType` varchar(50) NOT NULL,
  `CarSize` varchar(50) NOT NULL,
  `DriverName` varchar(100) NOT NULL,
  `PhoneNumber` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `packages`
--

CREATE TABLE `packages` (
  `PackageNumber` int(11) NOT NULL,
  `PackageName` varchar(100) NOT NULL,
  `PackageDescription` varchar(255) NOT NULL,
  `PackagePrice` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `packages`
--

INSERT INTO `packages` (`PackageNumber`, `PackageName`, `PackageDescription`, `PackagePrice`) VALUES
(1, 'Basic wash', 'Exterior hand wash', 5000.00),
(2, 'Premium wash', 'Full exterior and interior cleaning', 12000.00),
(3, 'Deluxe wash', 'Complete car detailing service', 20000.00);

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `PaymentNumber` int(11) NOT NULL,
  `AmountPaid` decimal(10,2) NOT NULL,
  `PaymentDate` date NOT NULL,
  `RecordNumber` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `servicepackages`
--

CREATE TABLE `servicepackages` (
  `RecordNumber` int(11) NOT NULL,
  `ServiceDate` date NOT NULL,
  `PlateNumber` varchar(20) NOT NULL,
  `PackageNumber` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `UserID` int(11) NOT NULL,
  `Username` varchar(50) NOT NULL,
  `Password` varchar(255) NOT NULL,
  `FullName` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`UserID`, `Username`, `Password`, `FullName`) VALUES
(1, 'admin', 'admin123', 'Administrator');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `cars`
--
ALTER TABLE `cars`
  ADD PRIMARY KEY (`PlateNumber`);

--
-- Indexes for table `packages`
--
ALTER TABLE `packages`
  ADD PRIMARY KEY (`PackageNumber`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`PaymentNumber`),
  ADD KEY `RecordNumber` (`RecordNumber`);

--
-- Indexes for table `servicepackages`
--
ALTER TABLE `servicepackages`
  ADD PRIMARY KEY (`RecordNumber`),
  ADD KEY `PlateNumber` (`PlateNumber`),
  ADD KEY `PackageNumber` (`PackageNumber`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`UserID`),
  ADD UNIQUE KEY `Username` (`Username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `packages`
--
ALTER TABLE `packages`
  MODIFY `PackageNumber` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `PaymentNumber` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `servicepackages`
--
ALTER TABLE `servicepackages`
  MODIFY `RecordNumber` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `UserID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`RecordNumber`) REFERENCES `servicepackages` (`RecordNumber`) ON DELETE CASCADE;

--
-- Constraints for table `servicepackages`
--
ALTER TABLE `servicepackages`
  ADD CONSTRAINT `servicepackages_ibfk_1` FOREIGN KEY (`PlateNumber`) REFERENCES `cars` (`PlateNumber`) ON DELETE CASCADE,
  ADD CONSTRAINT `servicepackages_ibfk_2` FOREIGN KEY (`PackageNumber`) REFERENCES `packages` (`PackageNumber`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
