-- Update admin password with bcrypt hash
-- This will replace the plain text 'admin123' with a properly hashed version
-- The admin can still login with username: admin, password: admin123

USE CWSMS;

UPDATE users 
SET Password = '$2b$10$fcCMWIGO8TblW/y9eiDq9umrtHLLfWbaclNdJPll6kJEJnFrT.0ZW' 
WHERE Username = 'admin';

-- Verify the update
SELECT UserID, Username, FullName, 
       CASE 
         WHEN Password LIKE '$2b$%' THEN 'Hashed (bcrypt)'
         ELSE 'Plain text'
       END as PasswordStatus
FROM users;
