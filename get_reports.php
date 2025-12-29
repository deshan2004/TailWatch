<?php
header('Content-Type: application/json');
require_once '../config/database.php';

try {
    $db = connectDB();
    
    $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 10;
    
    $sql = "SELECT r.*, u.first_name, u.last_name 
            FROM reports r 
            LEFT JOIN users u ON r.user_id = u.id 
            ORDER BY r.created_at DESC 
            LIMIT :limit";
    
    $stmt = $db->prepare($sql);
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->execute();
    
    $reports = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'reports' => $reports
    ]);
    
} catch(PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>