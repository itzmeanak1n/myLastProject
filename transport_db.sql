-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 03, 2025 at 07:32 AM
-- Server version: 10.4.27-MariaDB
-- PHP Version: 8.2.0

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `transport_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `places`
--

CREATE TABLE `places` (
  `placeId` int(11) NOT NULL,
  `placeName` varchar(50) NOT NULL,
  `link` varchar(255) NOT NULL,
  `pics` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Dumping data for table `places`
--

INSERT INTO `places` (`placeId`, `placeName`, `link`, `pics`) VALUES
(1, 'ตึก 80', 'https://maps.app.goo.gl/LbrspzbAToAoRQgo7', '1744201388702-510248825.jpg'),
(2, 'ตึก 38 IT', 'https://maps.app.goo.gl/C3kdseuKWkfDU4E98', '1744202228657-115959815.jpg'),
(3, 'อาคาร 7', 'https://maps.app.goo.gl/RPbfvZ3j9ENod4yL6', '1744223248764-562266425.jpg'),
(4, 'ห้องสมุด', 'https://maps.app.goo.gl/EjAt1GxQ3uajQ4kMA', '1744315502662-389847044.jpg'),
(5, 'ตลาดน้อย มมส', 'https://maps.app.goo.gl/uqPLeveCirfBoHoN9', '1752821784517-234383440.jpg'),
(6, 'บขส.มหาสารคาม', 'https://maps.app.goo.gl/HD3v9iZacodgNzpr7', '1753813655020-562496827.jpg'),
(7, 'ตลาดต้นสน', 'https://maps.app.goo.gl/cv8KS48QbSaSnJqM8?g_st=ic', '1753823900414-23170290.jpeg'),
(8, 'เสริมไทยคอมเพล็กซ์', 'https://maps.app.goo.gl/tDD5hmUYEdes9m7H9', '1759310005401-252059869.jpg');

-- --------------------------------------------------------

--
-- Table structure for table `riders`
--

CREATE TABLE `riders` (
  `riderId` varchar(15) NOT NULL,
  `riderNationalId` varchar(13) NOT NULL,
  `riderFirstname` varchar(30) NOT NULL,
  `riderLastname` varchar(30) NOT NULL,
  `riderEmail` varchar(50) NOT NULL,
  `riderPass` varchar(255) NOT NULL,
  `riderTel` varchar(15) NOT NULL,
  `riderAddress` varchar(255) NOT NULL,
  `RiderProfilePic` varchar(255) DEFAULT NULL,
  `RiderStudentCard` varchar(255) DEFAULT NULL,
  `riderLicense` varchar(255) NOT NULL,
  `QRscan` varchar(255) DEFAULT NULL,
  `status` enum('pending','approved','rejected','suspended') DEFAULT 'pending',
  `riderRate` decimal(3,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Dumping data for table `riders`
--

INSERT INTO `riders` (`riderId`, `riderNationalId`, `riderFirstname`, `riderLastname`, `riderEmail`, `riderPass`, `riderTel`, `riderAddress`, `RiderProfilePic`, `RiderStudentCard`, `riderLicense`, `QRscan`, `status`, `riderRate`) VALUES
('0000000000000', '0000000000000', '001', '001', '00@gmail.com', '$2b$10$25WZgaRsbJiwbtlIViumLegULaSyggsEM65zAEdeFPD1X72c2DM.C', '0000000000', '00/00', 'uploads\\1744305664851-69579078.jpg', 'uploads\\1744305664855-758616642.jpg', 'uploads\\1744305664871-576870619.jpg', 'uploads\\1744305664868-178911566.jpg', 'approved', NULL),
('653170010305', '1449400030577', 'Test', 'Test', 'api@gmail.com', '$2b$10$8.i.KiSjm07CbaZjEqe9GeRedGq/XDw0LR/TAbbQn8zpOSYlxh8Bm', '0639982238', '1/111', 'uploads\\1744257943273-496631594.png', 'uploads\\1744257943274-538423009.jpg', 'uploads\\1744257943279-814422625.jpg', 'uploads\\1744257943275-499457304.jpg', 'suspended', NULL),
('653170010315', '1449400030556', 'ศุภกิตต์', 'ทองบ่อ', 'suphakit315@gmail.com', '$2b$10$6JtqMrqTBEBmmRqPN2PP1OWhsBgfmw8y1xwyPbFhRQWw.UX6WbAx.', '0812345789', 'Mahasarakham', 'RiderProfilePic-1753542431073-130765937.jpg', 'uploads\\1752858507947-880756780.png', 'uploads\\1752858507953-914887252.jpg', 'uploads\\1752858507950-558506722.png', 'approved', '4.81'),
('653170010317', '1449400020963', 'Bowon', 'Test2', 'aa@gmail.com', '$2b$10$udeDw2qiPqMGPdtf.iHfNeuYc6dF.JPHMP/8ajuTP6YLOlYWueja6', '0639982238', '11/111', 'RiderProfilePic-1744268192202-864247249.jpg', 'RiderStudentCard-1744268167318-562333867.jpg', 'riderLicense-1744268180259-819664740.png', 'QRscan-1744268180258-433881191.png', 'approved', '5.00'),
('653170010320', '1449400020886', 'Puttipong', 'Tonjan', 'rider@gmail.com', '$2b$10$3If8rd43yuMNUNNYJ6m9Ceo2phr1pabcuLkPUMYXNYmMEP2D3hcA2', '0639982237', '11/111', 'RiderProfilePic-1753540418300-773713538.jpg', 'RiderStudentCard-1758967176404-590016876.jpg', 'riderLicense-1744310135910-718517667.jpg', 'QRscan-1758641342275-67347214.jpg', 'approved', '4.67'),
('653170010321', '1365951349126', 'ยัต', 'เฟ็ดเฟ่', 'natty123@gmail.com', '$2b$10$zEdPgwKi5tsZUAfs7WsM8OFLVvEEN3ol/bhKo1oEFX9FkLPx6QPom', '0953164168', '-', 'RiderProfilePic-1755590563534-717429597.jpg', 'uploads\\1755590134517-507876962.png', 'uploads\\1755590134523-426791140.jpg', 'uploads\\1755590134522-490183571.jpg', 'approved', NULL),
('653170010322', '1449400020887', 'Puttipong', 'Tonjan', 'rider2@gmail.com', '$2b$10$85Rz/fQcUBbPjuG1svAQ7OjYkZjr.4hGuZ9LkmyRSwqbHcKZcAnPa', '0639982238', '11/11', 'uploads\\1744222778375-537791501.jpg', 'uploads\\1744222778376-266694078.jpg', 'uploads\\1744222778379-972320298.png', 'uploads\\1744222778377-410962658.png', 'approved', NULL),
('653170010329', '1449400020221', 'Testing', 'Riderrefister', 'trg@gmail.com', '$2b$10$plRwHxy7yz4bMGD.FJIWe.jX0zngJvgagk.cA57JwAuKsvNcVUWNu', '1111111111', 'Mahasarakham', 'uploads\\1753824793342-84865161.jpg', 'uploads\\1753824793343-646848284.jpg', 'uploads\\1753824793346-348156687.jpg', 'uploads\\1753824793346-21565641.png', 'approved', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `ridervehical`
--

CREATE TABLE `ridervehical` (
  `carId` int(11) NOT NULL,
  `riderId` varchar(15) DEFAULT NULL,
  `carType` varchar(50) NOT NULL,
  `plate` varchar(20) NOT NULL,
  `brand` enum('Honda','Yamaha','Suzuki','Kawasaki','Other') NOT NULL,
  `model` varchar(20) NOT NULL,
  `insurancePhoto` varchar(255) DEFAULT NULL,
  `carPhoto` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Dumping data for table `ridervehical`
--

INSERT INTO `ridervehical` (`carId`, `riderId`, `carType`, `plate`, `brand`, `model`, `insurancePhoto`, `carPhoto`) VALUES
(1, '2147483647', 'motorcycle', '11', 'Suzuki', '12', 'uploads\\vehicles\\2147483647-insurancePhoto-1744190589837-330327426.jpg', 'uploads\\vehicles\\2147483647-carPhoto-1744190589843-300363383.jpg'),
(3, '2147483647', 'motorcycle', '1 กด 2560', 'Yamaha', 'เวฟ 110', '653170010320-insurancePhoto-1744215257418-489468926.jpg', '653170010320-carPhoto-1744215257423-302582675.png'),
(4, '653170010320', 'motorcycle', '4 ดค 5432', 'Honda', 'Wave 100', '653170010320-insurancePhoto-1758901829646-129373577.jpg', '653170010320-carPhoto-1744268043396-859096336.png'),
(5, '653170010322', 'motorcycle', '2 กด 7854', 'Yamaha', 'Mslaz', '653170010322-insurancePhoto-1744223018293-577745796.jpg', '653170010322-carPhoto-1744223018293-738024216.png'),
(7, '0000000000000', 'motorcycle', '9 กด 2560', 'Yamaha', 'Mslaz', '0000000000000-insurancePhoto-1744305992752-927516380.jpg', '0000000000000-carPhoto-1744305992754-434938081.png'),
(8, '653170010315', 'motorcycle', '2 กจ 4325', 'Honda', 'Wave 125', '653170010315-insurancePhoto-1752860126956-950946163.jpg', '653170010315-carPhoto-1754413143802-582570417.jpg'),
(10, '653170010329', 'car', 'กง 420', 'Other', 'Toyota AE86', '653170010329-insurancePhoto-1753824887367-289114128.jpg', '653170010329-carPhoto-1753824887368-64901234.jpg'),
(12, '653170010317', 'car', '4 กด 4567', 'Honda', 'Accord', '653170010317-insurancePhoto-1759314082449-356280078.jpg', '653170010317-carPhoto-1759314082449-873095320.jpg');

-- --------------------------------------------------------

--
-- Table structure for table `tb_user`
--

CREATE TABLE `tb_user` (
  `studentId` varchar(15) NOT NULL,
  `nationalId` varchar(13) NOT NULL,
  `userFirstname` varchar(30) NOT NULL,
  `userLastname` varchar(30) NOT NULL,
  `userEmail` varchar(50) NOT NULL,
  `userPass` varchar(255) NOT NULL,
  `userTel` varchar(15) NOT NULL,
  `userAddress` varchar(255) NOT NULL,
  `userprofilePic` varchar(255) DEFAULT NULL,
  `studentCard` varchar(255) DEFAULT NULL,
  `userRate` decimal(3,2) DEFAULT NULL,
  `role` enum('student','admin') DEFAULT 'student'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Dumping data for table `tb_user`
--

INSERT INTO `tb_user` (`studentId`, `nationalId`, `userFirstname`, `userLastname`, `userEmail`, `userPass`, `userTel`, `userAddress`, `userprofilePic`, `studentCard`, `userRate`, `role`) VALUES
('1212312121a', '', 'ดรีม', 'ขยี่ใบมะกรูด', 'dreammy123@gmail.com', '$2b$10$1o2v29CzZe8G3IzQkhSwJ.6vicKU4RmHRmdX0./MeSS97Spp04KGG', '123123aaa', '', NULL, NULL, NULL, 'student'),
('5556---กกกaaa', '', 'dddddd', 'fffff', 'a123----==@gmail.com', '$2b$10$8Z0JGn1XxfQ/zL5R5bg3f.h5Anm/O4Y8NSdfCUJzLV.CutArESdSS', '0990325408', 'a', NULL, NULL, NULL, 'student'),
('653130020243', '', 'Phenkanlaya', 'Chantaloeng', 'phenkanlaya043@gmail.com', '$2b$10$txYwuNAVqHEhv4qZUcdTteeNcRTaW40IH8Z0jlrR9lkJPx0MO.1U.', '0944175037', '', '/uploads/profile_pics/profile-1753604732611-909377282.jpg', NULL, NULL, 'student'),
('653170010110', '1449400020110', 'Butsakorn', 'Dream', 'butsadream@gmail.com', '$2b$10$EDkVpsTh8ex0FFLBh1yzyujteAtH8qBvYK8cQ6YfsDetqzqXoOupa', '0653321234', 'Mahasarakham', '/uploads/profile_pics/profile-1753815754357-410339448.jpg', NULL, NULL, 'student'),
('653170010301', '', 'Test', 'Test1', 'test@gmail.com', '$2b$10$h5.ExfIE4aIo0gI3.nHR9Ozx8J8u3xZF5.iKqWSB5SLndAUu9Iu1K', '0639982238', '', NULL, NULL, NULL, 'student'),
('653170010302', '', 'Nattharika', 'Dithjaoen', 'nattha@gmail.com', '$2b$10$ZPhs7I4zStSga1GQjiyZtOjgsnm6eccxnRPaOln6K9vZWHDz/Bdr6', '0968514710', 'Mahasarakham', '/uploads/profile_pics/profile-1754154423907-431041724.jpg', NULL, NULL, 'student'),
('653170010308', '1468133365149', 'Nat', 'nat', 'nat@mail.com', '$2b$10$NPZ8jfIrg1.uYBc45/YWt..3HBhzkcJ2CSgKvkDgWrUEpbBBbPYuO', '0953164168', '-', NULL, NULL, NULL, 'student'),
('653170010311', '1449400020112', 'Puttipong', 'Tonjan', 'admin@gmail.com', '$2b$10$BCHsFa4oD1nkZem12G/tC.crF8n/DxCD/Ya9wgVw.hXVFUQZvSscy', '1111111111', '11 qwer', NULL, NULL, NULL, 'admin'),
('653170010317', '', 'Bowon', 'Test2', 'st@gmail.com', '$2b$10$6WTOLfqUl.ZdWTILZBGK/OrHsVHrJDunBXntpIkFpQAcGophcbnPu', '0639982231', '', NULL, NULL, NULL, 'student'),
('653170010346', '', 'Puttipong', 'Tonjan', '11@gmail.com', '$2b$10$EG7YVq66uDTHD8ZQCxYrB.wCaWpC6W/jkhtF59E2eFXYzLXMmQnqm', '1111111111', '', NULL, NULL, NULL, 'student'),
('663170010321', '', 'Sasitorn', 'Wangsawad', 'ssb@gmail.com', '$2b$10$.IrFI0/qx5Yiylgupcr0cu/.QoXvEDsR.BG8vhhnKcMFUDtxbgKlO', '0653321569', '', '/uploads/profile_pics/profile-1753822244501-364531593.jpg', NULL, NULL, 'student'),
('798451321231', '5215854651511', 'Tester', 'Kupp', 'testder@gmail.com', '$2b$10$NRtdk6jmQQcx9EaCvcoWROX.Lltva2u7wI0sxOLVUKmrO6b/p7Xwm', '0647895541', 'Kalasin', '/uploads/profile_pics/profile-1758697360011-432305425.jpg', NULL, NULL, 'student'),
('798451321233', '5215854651514', 'Tester', 'Kupp2', 'testder2@gmail.com', '$2b$10$sR0sW1dh.ZxYUw.8I3BD3OzNOcDOIQqpgvAINMIHfYl2ZnB2SMXPe', '0647895541', '11/111', NULL, NULL, NULL, 'student'),
('riw1212312121', '', 'นาโอ', 'คิมิโนโต๊ะ', 'a123@gmail.com', '$2b$10$T6RSZ4BOgqupuSthSnKWTePPHdUl8Q6ShO7X4b0QAnLCYaJQlxgUu', '0990325408', '', NULL, NULL, NULL, 'student');

-- --------------------------------------------------------

--
-- Table structure for table `trips`
--

CREATE TABLE `trips` (
  `tripId` int(11) NOT NULL,
  `createdAt` datetime DEFAULT current_timestamp(),
  `studentId` varchar(15) NOT NULL,
  `placeIdPickUp` int(11) NOT NULL,
  `placeIdDestination` int(11) NOT NULL,
  `date` datetime NOT NULL,
  `userRate` decimal(3,2) DEFAULT NULL,
  `carType` varchar(50) NOT NULL,
  `status` varchar(255) NOT NULL,
  `is_round_trip` varchar(255) NOT NULL,
  `rider_id` varchar(15) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Dumping data for table `trips`
--

INSERT INTO `trips` (`tripId`, `createdAt`, `studentId`, `placeIdPickUp`, `placeIdDestination`, `date`, `userRate`, `carType`, `status`, `is_round_trip`, `rider_id`) VALUES
(16, '2025-07-26 01:25:23', '653170010302', 1, 2, '2025-04-09 16:27:42', '5.00', 'motorcycle', 'success', '', '653170010320'),
(17, '2025-07-26 01:25:23', '653170010302', 2, 1, '2025-04-09 16:35:32', '5.00', 'motorcycle', 'success', '', '653170010320'),
(18, '2025-07-26 01:25:23', '653170010302', 2, 1, '2025-04-09 17:31:06', '5.00', 'motorcycle', 'success', '', '653170010320'),
(19, '2025-07-26 01:25:23', '653170010302', 2, 1, '2025-04-09 18:22:07', NULL, 'motorcycle', 'success', '', '653170010322'),
(20, '2025-07-26 01:25:23', '653170010301', 2, 1, '2025-04-09 18:25:18', NULL, 'motorcycle', 'success', '', '653170010317'),
(21, '2025-07-26 01:25:23', '653170010301', 3, 1, '2025-04-09 18:27:46', NULL, 'motorcycle', 'success', '', '653170010317'),
(22, '2025-07-26 01:25:23', '653170010346', 2, 3, '2025-04-10 06:57:32', NULL, 'motorcycle', 'success', '', '653170010320'),
(23, '2025-07-26 01:25:23', '653170010302', 3, 4, '2025-04-10 20:05:17', '5.00', 'motorcycle', 'success', '', '653170010320'),
(24, '2025-07-26 01:25:23', '653170010302', 4, 1, '2025-04-10 23:06:28', '4.00', 'motorcycle', 'success', '', '653170010320'),
(25, '2025-07-26 01:25:23', '653170010302', 2, 3, '2025-04-10 20:10:50', '5.00', 'motorcycle', 'success', '', '653170010320'),
(26, '2025-07-26 01:25:23', '653170010302', 1, 2, '2025-04-10 20:13:41', '5.00', 'car', 'success', '', '653170010320'),
(27, '2025-07-26 01:25:23', '653170010317', 2, 3, '2025-04-12 15:55:51', NULL, 'car', 'success', '', '653170010320'),
(28, '2025-07-26 01:25:23', '653170010317', 1, 2, '2025-04-12 16:01:14', NULL, 'motorcycle', 'success', '', '653170010320'),
(29, '2025-07-26 01:25:23', '653170010317', 1, 3, '2025-04-12 16:04:10', NULL, 'car', 'success', '', '653170010320'),
(30, '2025-07-26 01:25:23', '653170010317', 1, 2, '2025-04-12 16:18:05', NULL, 'car', 'success', '1', '653170010320'),
(31, '2025-07-26 01:25:23', '653170010317', 2, 1, '2025-04-19 16:24:31', NULL, 'car', 'success', '1', '653170010320'),
(33, '2025-07-26 01:25:23', '653170010302', 3, 4, '2025-04-12 16:43:54', '5.00', 'motorcycle', 'success', '1', '653170010320'),
(49, '2025-07-26 01:25:23', '653170010302', 2, 3, '2025-06-13 07:18:08', '5.00', 'car', 'success', '0', '653170010320'),
(50, '2025-07-26 01:25:23', '653170010302', 3, 2, '2025-06-13 07:18:18', NULL, 'motorcycle', 'accepted', '1', '0000000000000'),
(52, '2025-07-26 01:25:23', '653170010302', 3, 4, '2025-07-06 15:27:35', '5.00', 'car', 'success', '1', '653170010320'),
(53, '2025-07-26 01:25:23', '653170010302', 2, 1, '2025-07-07 01:30:16', '5.00', 'motorcycle', 'success', '0', '653170010320'),
(54, '2025-07-26 01:25:23', '653170010302', 5, 3, '2025-07-18 07:51:48', '5.00', 'motorcycle', 'success', '0', '653170010320'),
(55, '2025-07-26 01:25:23', '653130020243', 3, 5, '2025-07-19 03:46:18', '5.00', 'car', 'success', '1', '653170010315'),
(56, '2025-07-26 01:25:23', '653130020243', 1, 5, '2025-07-19 03:55:09', '4.00', 'motorcycle', 'success', '1', '653170010315'),
(57, '2025-07-26 01:25:23', '653130020243', 2, 5, '2025-07-19 10:57:00', '4.50', 'motorcycle', 'success', '1', '653170010315'),
(67, '2025-07-26 13:33:34', '653170010302', 5, 3, '2025-07-26 13:33:00', '5.00', 'motorcycle', 'success', '0', '653170010315'),
(70, '2025-07-26 21:06:43', '653130020243', 4, 5, '2025-07-26 21:06:00', '5.00', 'motorcycle', 'success', '1', '653170010315'),
(71, '2025-07-26 21:17:52', '653130020243', 5, 3, '2025-07-26 22:00:00', '4.50', 'car', 'success', '0', '653170010320'),
(72, '2025-07-26 21:32:46', '653130020243', 5, 1, '2025-07-26 21:32:00', NULL, 'motorcycle', 'cancelled', '1', NULL),
(73, '2025-07-26 21:35:11', '653130020243', 5, 1, '2025-07-26 21:35:00', '4.00', 'motorcycle', 'success', '1', '653170010320'),
(76, '2025-07-27 15:25:03', '653130020243', 5, 4, '2025-07-27 15:24:00', '5.00', 'motorcycle', 'success', '1', '653170010315'),
(77, '2025-07-27 16:10:05', '653130020243', 2, 5, '2025-07-27 16:09:00', '4.50', 'motorcycle', 'success', '0', '653170010315'),
(78, '2025-07-27 16:35:10', '653170010302', 3, 2, '2025-07-27 16:35:00', NULL, 'motorcycle', 'cancelled', '1', NULL),
(79, '2025-07-28 00:01:55', '653170010302', 2, 4, '2025-07-28 00:01:00', NULL, 'motorcycle', 'cancelled', '0', NULL),
(80, '2025-07-28 02:46:53', '653130020243', 5, 1, '2025-07-28 02:46:00', '5.00', 'motorcycle', 'success', '1', '653170010315'),
(81, '2025-07-30 02:29:14', '653170010110', 6, 5, '2025-07-30 02:29:00', '4.50', 'motorcycle', 'success', '0', '653170010315'),
(82, '2025-07-30 03:51:04', '663170010321', 2, 5, '2025-07-30 03:50:00', '5.00', 'motorcycle', 'success', '0', '653170010315'),
(83, '2025-07-30 04:22:32', '663170010321', 7, 6, '2025-07-30 04:22:00', '5.00', 'motorcycle', 'success', '0', '653170010315'),
(84, '2025-08-19 13:37:16', 'riw1212312121', 1, 2, '2025-08-20 14:30:00', '1.00', 'motorcycle', 'success', '1', '653170010320'),
(85, '2025-08-19 13:46:40', '5556---กกกaaa', 1, 7, '2025-08-20 17:20:00', NULL, 'motorcycle', 'cancelled', '1', NULL),
(86, '2025-08-19 14:18:46', '653170010308', 2, 6, '2025-08-19 14:13:00', '5.00', 'motorcycle', 'success', '1', '653170010320'),
(87, '2025-08-19 15:23:33', '1212312121a', 5, 2, '2025-08-20 20:20:00', NULL, 'motorcycle', 'success', '1', '653170010320'),
(88, '2025-08-19 15:24:42', '1212312121a', 5, 2, '2025-08-21 20:20:00', NULL, 'motorcycle', 'success', '1', '653170010320'),
(89, '2025-08-19 15:24:48', '1212312121a', 5, 2, '2025-08-22 20:20:00', NULL, 'motorcycle', 'cancelled', '1', NULL),
(90, '2025-08-19 15:24:54', '1212312121a', 5, 2, '2025-08-23 20:20:00', NULL, 'motorcycle', 'cancelled', '1', NULL),
(91, '2025-09-08 23:17:20', '653170010302', 7, 5, '2025-09-08 23:17:00', '5.00', 'motorcycle', 'success', '0', '653170010315'),
(92, '2025-09-08 23:21:53', '653170010302', 3, 6, '2025-09-08 23:17:00', '5.00', 'motorcycle', 'success', '0', '653170010315'),
(93, '2025-09-23 19:43:48', '653170010302', 3, 5, '2025-09-23 19:43:00', '5.00', 'motorcycle', 'success', '0', '653170010320'),
(94, '2025-09-23 23:26:25', '653170010302', 2, 4, '2025-09-23 23:24:00', '5.00', 'motorcycle', 'success', '0', '653170010320'),
(95, '2025-09-24 14:03:13', '798451321231', 2, 6, '2025-09-24 14:02:00', NULL, 'car', 'success', '1', '653170010320'),
(96, '2025-09-26 00:05:28', '653170010302', 7, 1, '2025-09-26 00:05:00', NULL, 'motorcycle', 'cancelled', '1', NULL),
(97, '2025-09-26 00:11:14', '653170010302', 5, 1, '2025-09-26 00:10:00', '5.00', 'car', 'success', '0', '653170010320'),
(98, '2025-09-26 00:15:59', '653170010302', 1, 6, '2025-09-26 00:15:00', '4.50', 'car', 'success', '1', '653170010320'),
(103, '2025-10-01 16:09:14', '653170010302', 4, 3, '2025-10-01 16:09:00', '5.00', 'motorcycle', 'success', '0', '653170010317'),
(104, '2025-10-01 17:25:19', '653170010302', 8, 2, '2025-10-01 17:24:00', NULL, 'car', 'accepted', '1', '653170010317'),
(105, '2025-10-02 22:14:50', '653170010302', 6, 7, '2025-10-02 22:14:00', NULL, 'motorcycle', 'cancelled', '0', NULL),
(106, '2025-10-02 22:16:31', '653170010302', 6, 5, '2025-10-02 22:16:00', NULL, 'motorcycle', 'cancelled', '0', NULL),
(107, '2025-10-02 22:17:21', '653170010302', 7, 2, '2025-10-02 22:17:00', '5.00', 'motorcycle', 'success', '0', '653170010320'),
(108, '2025-10-03 01:29:39', '653170010302', 6, 3, '2025-10-03 01:29:00', NULL, 'motorcycle', 'pending', '1', NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `places`
--
ALTER TABLE `places`
  ADD PRIMARY KEY (`placeId`),
  ADD UNIQUE KEY `placeName` (`placeName`);

--
-- Indexes for table `riders`
--
ALTER TABLE `riders`
  ADD PRIMARY KEY (`riderId`),
  ADD UNIQUE KEY `riderEmail` (`riderEmail`);

--
-- Indexes for table `ridervehical`
--
ALTER TABLE `ridervehical`
  ADD PRIMARY KEY (`carId`),
  ADD KEY `riderId` (`riderId`);

--
-- Indexes for table `tb_user`
--
ALTER TABLE `tb_user`
  ADD PRIMARY KEY (`studentId`),
  ADD UNIQUE KEY `userEmail` (`userEmail`);

--
-- Indexes for table `trips`
--
ALTER TABLE `trips`
  ADD PRIMARY KEY (`tripId`),
  ADD KEY `studentId` (`studentId`),
  ADD KEY `placeIdPickUp` (`placeIdPickUp`),
  ADD KEY `placeIdDestination` (`placeIdDestination`),
  ADD KEY `trips_ibfk_4` (`rider_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `places`
--
ALTER TABLE `places`
  MODIFY `placeId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `ridervehical`
--
ALTER TABLE `ridervehical`
  MODIFY `carId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `trips`
--
ALTER TABLE `trips`
  MODIFY `tripId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=109;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `trips`
--
ALTER TABLE `trips`
  ADD CONSTRAINT `trips_ibfk_1` FOREIGN KEY (`studentId`) REFERENCES `tb_user` (`studentId`),
  ADD CONSTRAINT `trips_ibfk_2` FOREIGN KEY (`placeIdPickUp`) REFERENCES `places` (`placeId`),
  ADD CONSTRAINT `trips_ibfk_4` FOREIGN KEY (`rider_id`) REFERENCES `riders` (`riderId`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
