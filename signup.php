<?php
session_start();
require_once 'config/database.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $firstName = $_POST['firstName'];
    $lastName = $_POST['lastName'];
    $email = $_POST['email'];
    $password = $_POST['password'];
    $userType = $_POST['userType'];
    
    try {
        $db = connectDB();
        
        $sql = "INSERT INTO users (first_name, last_name, email, password, user_type, user_role) 
                VALUES (:first_name, :last_name, :email, :password, :user_type, :user_role)";
        
        $stmt = $db->prepare($sql);
        
        $hashed_password = password_hash($password, PASSWORD_DEFAULT);
        
        $db_user_type = ($userType == 'veterinarian' || $userType == 'animal_rescue') ? 'staff' : 'user';
        
        $stmt->execute([
            ':first_name' => $firstName,
            ':last_name' => $lastName,
            ':email' => $email,
            ':password' => $hashed_password,
            ':user_type' => $db_user_type,
            ':user_role' => $userType
        ]);
        
        $_SESSION['user_email'] = $email;
        $_SESSION['user_role'] = $db_user_type;
        $_SESSION['logged_in'] = true;
        
        echo "<script>
            localStorage.setItem('userRole', '$db_user_type');
            localStorage.setItem('userEmail', '$email');
            localStorage.setItem('userName', '$firstName $lastName');
            localStorage.setItem('userType', '$userType');
            alert('Account created successfully!');
            window.location.href = 'dashboard.html';
        </script>";
        
    } catch(PDOException $e) {
        echo "<script>alert('Error: " . $e->getMessage() . "'); window.history.back();</script>";
    }
}
?>