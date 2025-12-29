<?php
header('Content-Type: application/json');
require_once '../config/database.php';

session_start();

$response = ['success' => false, 'message' => ''];

try {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!$data) {
        throw new Exception('No data received');
    }
    
    if (empty($data['location']) || empty($data['status']) || empty($data['description'])) {
        throw new Exception('Missing required fields');
    }
    
    $db = connectDB();
    
    $report_id = 'R-' . date('Y') . '-' . str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);
    
    $user_id = null;
    if (!empty($_SESSION['user_id'])) {
        $user_id = $_SESSION['user_id'];
    } elseif (!empty($data['user_email'])) {
        $stmt = $db->prepare("SELECT id FROM users WHERE email = :email");
        $stmt->execute([':email' => $data['user_email']]);
        if ($user = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $user_id = $user['id'];
        }
    }
    
    $sql = "INSERT INTO reports (report_id, user_id, dog_location, dog_status, description, 
            reporter_contact, latitude, longitude, status, created_at) 
            VALUES (:report_id, :user_id, :location, :status, :description, 
            :contact, :latitude, :longitude, 'pending', NOW())";
    
    $stmt = $db->prepare($sql);
    
    $stmt->execute([
        ':report_id' => $report_id,
        ':user_id' => $user_id,
        ':location' => $data['location'],
        ':status' => $data['status'],
        ':description' => $data['description'],
        ':contact' => $data['reporter_contact'] ?? '',
        ':latitude' => $data['latitude'] ?? null,
        ':longitude' => $data['longitude'] ?? null
    ]);
    
    if ($user_id) {
        $update_sql = "UPDATE users SET reports_count = reports_count + 1, 
                      points = points + 10 WHERE id = :user_id";
        $update_stmt = $db->prepare($update_sql);
        $update_stmt->execute([':user_id' => $user_id]);
    }
    
    $response['success'] = true;
    $response['message'] = 'Report submitted successfully';
    $response['report_id'] = $report_id;
    
} catch(PDOException $e) {
    $response['message'] = 'Database error: ' . $e->getMessage();
} catch(Exception $e) {
    $response['message'] = $e->getMessage();
}

echo json_encode($response);
?>