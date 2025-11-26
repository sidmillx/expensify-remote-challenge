<?php

    ini_set('memory_limit', '512M');


    $orig = "http://localhost";
    header("Access-Control-Allow-Origin: $orig");
    header("Access-Control-Allow-Credentials: true");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS");

    $api_base = "https://www.expensify.com/api/";
    // $partnerName = "applicant";
    // $partnerPassword = "d7c3119c6cdab02d68d9";

    // $partnerName = getenv("EXPENSIFY_PARTNER_NAME");
    // $partnerPassword = getenv("EXPENSIFY_PARTNER_PASSWORD");


    // Get action from request
    $action = $_GET["action"] ?? $_POST["action"] ?? null;



    /// AUTHENTICATE USER 
    if($action === "authenticate"){
        $url = $api_base . "Authenticate";
        $method = "POST";
        $data = json_decode(file_get_contents('php://input'), true);

        // Convert JSON to x-www-form-urlencoded
        $data = http_build_query([
            "partnerName" => $partnerName,
            "partnerPassword" => $partnerPassword,
            "partnerUserID" => $data['partnerUserID'],
            "partnerUserSecret" => $data['partnerUserSecret']
        ]);
    }



    /// GET TRANSACTIONS
    else if($action === "getTransactions"){

        $authToken = $_GET["authToken"] ?? "";
        $returnValueList = $_GET["returnValueList"] ?? "transactionList";

        // Optional start and end date filters
        $startDate = $_GET["startDate"] ?? null;
        $endDate = $_GET["endDate"] ?? null;

        $query = [
            "authToken" => $authToken,
            "returnValueList" => $returnValueList
        ];

        if($startDate) $query["startDate"] = $startDate;
        if($endDate) $query["endDate"] = $endDate;
        
        $url = $api_base . "Get?" . http_build_query($query);
        $method = "GET";

    }



    /// CREATE TRANSACTION
    else if($action === "createTransaction") {
        
        $data = json_decode(file_get_contents('php://input'), true);
        $data = http_build_query($data);
        $url = $api_base . "CreateTransaction";
        $method = "POST";

    } 

    /// LOGOUT USER
    else if($action === "logout"){

        // clear authToken cookie
        setcookie("authToken", "", [
                'expires' => time() - 3600,
                'path' => '/',
                'secure' => false,    // TO DO: change to true on HTTPS
                'httponly' => false,  
                'samesite' => 'Lax'
            ]);

        echo json_encode(["message" => "Logged out"]);
        exit;

    } 

    /// INVALID ACTION
    else {
        http_response_code(400);
        echo json_encode(["error" => "Action invalid"]);
        exit;
    }

    // Prepare the headers
    $headers = [
        "Content-Type: application/x-www-form-urlencoded",
        "expensifyengineeringcandidate: hired" 
    ];


    // forward auth header if it exists
    if(!empty($_SERVER['HTTP_AUTHORIZATION'])){
        $headers[] = "Authorization: " . $_SERVER['HTTP_AUTHORIZATION'];
    }




    //// build and set curl request to extensify API
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

    if($method == "POST"){
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
    }
    $res = curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE); // get response status code
    unset($ch);


    // Set authToken cookie if it is present in response
    $resData = json_decode($res, true);
    if(isset($resData['authToken'])){
        setcookie("authToken", $resData['authToken'], [
                'expires' => time() + 3600,
                'path' => '/',
                'secure' => false,    
                'httponly' => false,  // changed this
                'samesite' => 'Lax'   
            ]);


    }

    http_response_code($status);
    header("Content-Type: application/json");
    echo $res;
?>
