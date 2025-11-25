<?php

$orig = "http://localhost";
header("Access-Control-Allow-Origin: $orig");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");

$api_base = "https://www.expensify.com/api/";

// Get action from request
$action = $_GET["action"] ?? $_POST["action"] ?? null;

if($action === "authenticate"){
    $url = $api_base . "Authenticate";
    $method = "POST";
    // $data = file_get_contents('php://input')
     // Get JSON payload from frontend
    $data = json_decode(file_get_contents('php://input'), true);

    // Convert JSON to x-www-form-urlencoded
    $data = http_build_query([
    "partnerName" => $data['partnerName'],
    "partnerPassword" => $data['partnerPassword'],
    "partnerUserID" => $data['partnerUserID'],
    "partnerUserSecret" => $data['partnerUserSecret']
]);
} else if($action === "getTransactions"){

    $authToken = $_GET["authToken"] ?? "";
    $returnValueList = $_GET["returnValueList"] ?? "transactionList";

    $url = $api_base . "Get?" . http_build_query([
        "authToken" => $authToken,
        "returnValueList" => $returnValueList
    ]);
    $method = "GET";

} else if($action === "createTransaction") {
    $url = $api_base . "CreateTransaction";
    $method = "POST";
    $data = json_decode(file_get_contents('php://input'), true);
    $data = http_build_query($data);

} else if($action === "logout"){
    setcookie("authToken", "", [
            'expires' => time() - 3600,
            'path' => '/',
            'secure' => false,    // true if you host on HTTPS
            'httponly' => false,  // change to true if you don’t need JS access
            'samesite' => 'Lax'   // or 'None' if cross-site with HTTPS
        ]);
    echo json_encode(["message" => "Logged out"]);
    exit;
} else {
    http_response_code(400);
    echo json_encode(["error" => "Action invalid"]);
    exit;
}

// prepare the headers ----- had problem with this was json
$headers = [
    // "Content-Type: application/json",
    "Content-Type: application/x-www-form-urlencoded",
    "expensifyengineeringcandidate: hired" 
];


// forward auth header if it exists
if(!empty($_SERVER['HTTP_AUTHORIZATION'])){
    $headers[] = "Authorization: " . $_SERVER['HTTP_AUTHORIZATION'];
}

// build and set curl request
$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

if($method == "POST"){
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
    // curl_setopt($ch, CURLOPT_POSTFIELDS, $post);

}

// execute curl request and get status code
$res = curl_exec($ch);
$status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
unset($ch);


$resData = json_decode($res, true);
if(isset($resData['authToken'])){
    // setcookie("authToken", $resData['authToken'], time() + 3600, "/", "", false, false);
    setcookie("authToken", $resData['authToken'], [
            'expires' => time() + 3600,
            'path' => '/',
            'secure' => false,    // true if you host on HTTPS
            'httponly' => false,  // changed this
            'samesite' => 'Lax'   // or 'None' if cross-site with HTTPS
        ]);


}

http_response_code($status);
header("Content-Type: application/json");
echo $res;

// if(isset($res['authToken'])){
//     setcookie("authToken", $res['authToken'], time()+ 3600, "/", "", false, false);
// }



error_log("RAW API RESPONSE: " . $res);   // full raw string
error_log("HEADERS: " . print_r($headers, true));
error_log("==============================\n");
// error_log($res["authToken"]);


?>
