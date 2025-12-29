<?php
session_start();
require_once 'config/database.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $email = $_POST['email'];
    $password = $_POST['password'];
    
    if (!empty($email) && !empty($password)) {
        
        $_SESSION['user_email'] = $email;
        $_SESSION['logged_in'] = true;
        
        if (strpos($email, 'admin') !== false) {
            $_SESSION['user_role'] = 'admin';
            $redirect = 'admin-dashboard.html';
        } elseif (strpos($email, 'vet') !== false || strpos($email, 'staff') !== false) {
            $_SESSION['user_role'] = 'staff';
            $redirect = 'staff-dashboard.html';
        } else {
            $_SESSION['user_role'] = 'user';
            $redirect = 'dashboard.html';
        }
        
        echo "<script>
            localStorage.setItem('userRole', '" . $_SESSION['user_role'] . "');
            localStorage.setItem('userEmail', '" . $email . "');
            localStorage.setItem('userName', '" . ucfirst(explode('@', '$email')[0]) . "');
            window.location.href = '$redirect';
        </script>";
        exit;
    }
}
?>

<!DOCTYPE html>
<html>
<head>
    <title>Login - TailWatch</title>
</head>
<body>
    <h2>Login Page</h2>
    <p>Redirecting...</p>
</body>
</html>