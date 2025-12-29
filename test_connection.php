<?php
require_once 'config/database.php';

$db = connectDB();

if ($db) {
    echo "<h2 style='color: green;'>✅ Database Connection Successful!</h2>";
    
    try {
        $stmt = $db->query("SELECT COUNT(*) as count FROM users");
        $result = $stmt->fetch();
        echo "<p>Total Users in Database: <strong>" . $result['count'] . "</strong></p>";
    } catch(PDOException $e) {
        echo "<p style='color: red;'>Query Error: " . $e->getMessage() . "</p>";
    }
} else {
    echo "<h2 style='color: red;'>❌ Database Connection Failed!</h2>";
}
?>