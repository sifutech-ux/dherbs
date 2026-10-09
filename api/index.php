<?php
declare(strict_types=1);

header("Content-Type: application/json; charset=utf-8");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(204);
    exit;
}

$rates = ["master" => 0.6, "stockist" => 0.7, "agen" => 0.8, "pelanggan" => 1.0];

function seed_products(): array
{
    return [[
        "id" => "samma-denim",
        "name" => "D'Herbs Samma Denim Bag",
        "line" => "Beg tangan berkilat sederhana, Medium Glossy, bersama kotak.",
        "sell" => 100.0,
        "cost" => 55.0,
    ]];
}

function data_path(): string
{
    $dir = dirname(__DIR__, 2) . "/dherbs-data";
    if (!is_dir($dir)) {
        @mkdir($dir, 0700, true);
    }
    if (!is_dir($dir) || !is_writable($dir)) {
        $dir = __DIR__ . "/data";
        if (!is_dir($dir)) {
            mkdir($dir, 0700, true);
        }
    }
    return $dir . "/db.json";
}

function empty_db(): array
{
    return ["agents" => [], "orders" => [], "sales" => [], "dropships" => [], "tokens" => [], "products" => []];
}

function ensure_db(): array
{
    $db = load_db();
    if (!isset($db["products"]) || !is_array($db["products"]) || count($db["products"]) === 0) {
        $db["products"] = seed_products();
        save_db($db);
    }
    return $db;
}

function load_db(): array
{
    $path = data_path();
    if (!is_file($path)) {
        return empty_db();
    }
    $raw = file_get_contents($path);
    $parsed = json_decode($raw ?: "", true);
    return is_array($parsed) ? array_merge(empty_db(), $parsed) : empty_db();
}

function save_db(array $db): void
{
    $path = data_path();
    $fh = fopen($path, "c+");
    if ($fh === false) {
        throw new RuntimeException("Rekod tidak boleh disimpan.");
    }
    flock($fh, LOCK_EX);
    ftruncate($fh, 0);
    rewind($fh);
    fwrite($fh, json_encode($db, JSON_UNESCAPED_UNICODE));
    fflush($fh);
    flock($fh, LOCK_UN);
    fclose($fh);
}

function uid(): string
{
    return bin2hex(random_bytes(8));
}

function round2(float $n): float
{
    return round($n, 2);
}

function unit_price(array $product, string $tier): float
{
    global $rates;
    return round2($product["sell"] * $rates[$tier]);
}

function visible_products(array $db, bool $withCost): array
{
    $out = [];
    foreach ($db["products"] as $product) {
        $row = [
            "id" => $product["id"],
            "name" => $product["name"],
            "line" => $product["line"],
            "sell" => (float)$product["sell"],
        ];
        if ($withCost) {
            $row["cost"] = (float)$product["cost"];
        }
        $out[] = $row;
    }
    return $out;
}

function quote(array $lines, array $map): array
{
    $pay = function (string $tier) use ($lines, $map): float {
        $sum = 0.0;
        foreach ($lines as $line) {
            $sum += unit_price($map[$line["productId"]], $tier) * $line["qty"];
        }
        return round2($sum);
    };
    $master = $pay("master");
    if ($master >= 15000) return ["tier" => "master", "total" => $master];
    $stockist = $pay("stockist");
    if ($stockist >= 5000) return ["tier" => "stockist", "total" => $stockist];
    $agen = $pay("agen");
    if ($agen >= 500) return ["tier" => "agen", "total" => $agen];
    return ["tier" => "pelanggan", "total" => $pay("pelanggan")];
}

function public_db(array $db): array
{
    $agents = [];
    foreach ($db["agents"] as $agent) {
        unset($agent["password"]);
        $agents[] = $agent;
    }
    return [
        "agents" => $agents,
        "orders" => $db["orders"],
        "sales" => $db["sales"],
        "dropships" => $db["dropships"],
    ];
}

function actor(array $db, string $token): ?array
{
    $agentId = $db["tokens"][$token] ?? null;
    if (!$agentId) return null;
    foreach ($db["agents"] as $agent) {
        if ($agent["id"] === $agentId) return $agent;
    }
    return null;
}

function fail(string $error, int $code = 400): void
{
    http_response_code($code);
    echo json_encode(["ok" => false, "error" => $error], JSON_UNESCAPED_UNICODE);
    exit;
}

function ok(array $payload): void
{
    echo json_encode(["ok" => true] + $payload, JSON_UNESCAPED_UNICODE);
    exit;
}

$body = json_decode(file_get_contents("php://input") ?: "{}", true);
if (!is_array($body)) $body = [];
$action = $_GET["action"] ?? ($body["action"] ?? "");
$token = $_SERVER["HTTP_X_DHERBS_TOKEN"] ?? ($body["token"] ?? "");

if ($action === "katalog") {
    ok(["products" => visible_products(ensure_db(), false)]);
}

if ($action === "status") {
    $db = load_db();
    $ada = false;
    foreach ($db["agents"] as $agent) {
        if ($agent["rank"] === "rumah") $ada = true;
    }
    ok(["rumah" => $ada]);
}

$db = ensure_db();

if ($action === "buka" || $action === "daftar" || $action === "masuk") {
    $name = trim((string)($body["name"] ?? ""));
    $phone = preg_replace("/\s+/", "", (string)($body["phone"] ?? ""));
    $username = strtolower(preg_replace("/\s+/", "", (string)($body["username"] ?? "")));
    $email = strtolower(trim((string)($body["email"] ?? "")));
    $password = (string)($body["password"] ?? "");
    $rank = (string)($body["rank"] ?? "ejen");
    $code = strtoupper(trim((string)($body["code"] ?? "")));

    if ($action === "masuk") {
        $key = strtolower(trim((string)($body["username"] ?? "")));
        foreach ($db["agents"] as $agent) {
            $match = $agent["username"] === $key || $agent["phone"] === $key || $agent["email"] === $key;
            if ($match && password_verify($password, $agent["password"])) {
                $issued = uid() . uid();
                $db["tokens"][$issued] = $agent["id"];
                save_db($db);
                ok(["token" => $issued, "agent" => ["id" => $agent["id"], "name" => $agent["name"], "rank" => $agent["rank"]], "db" => public_db($db)]);
            }
        }
        fail("Akaun atau kata laluan tidak sepadan.", 401);
    }

    if (strlen($name) < 2) fail("Nama perlu diisi.");
    if (strlen($phone) < 9) fail("Nombor telefon perlu diisi.");
    if (strlen($username) < 3) fail("Username sekurang-kurangnya 3 aksara.");
    if (strlen($password) < 6) fail("Kata laluan sekurang-kurangnya 6 aksara.");
    foreach ($db["agents"] as $agent) {
        if ($agent["phone"] === $phone || $agent["username"] === $username) {
            fail("Telefon atau username ini sudah ada akaun.");
        }
    }

    if ($action === "buka") {
        foreach ($db["agents"] as $agent) {
            if ($agent["rank"] === "rumah") fail("Meja rumah sudah dibuka.");
        }
        $rank = "rumah";
    } elseif ($rank !== "ejen" && $rank !== "dropship") {
        fail("Pangkat ini tidak dibuka pada borang.");
    }

    $supplierId = null;
    if ($rank === "ejen" && $code !== "") {
        $supplier = null;
        foreach ($db["agents"] as $agent) {
            if ($agent["code"] === $code) $supplier = $agent;
        }
        if (!$supplier) fail("Kod inventori tidak dijumpai.");
        if ($supplier["rank"] !== "ejen") fail("Kod ini bukan pemegang inventori.");
        $supplierId = $supplier["id"];
    }

    $base = strtoupper(substr(preg_replace("/[^a-zA-Z]/", "", $name) ?: "EJN", 0, 4));
    do {
        $inventory = $base . random_int(10, 99);
        $taken = false;
        foreach ($db["agents"] as $agent) {
            if ($agent["code"] === $inventory) $taken = true;
        }
    } while ($taken);

    $agent = [
        "id" => uid(),
        "name" => $name,
        "phone" => $phone,
        "username" => $username,
        "email" => $email,
        "password" => password_hash($password, PASSWORD_DEFAULT),
        "pin" => "",
        "code" => $inventory,
        "rank" => $rank,
        "supplierId" => $supplierId,
        "createdAt" => gmdate("c"),
    ];
    $db["agents"][] = $agent;
    $issued = uid() . uid();
    $db["tokens"][$issued] = $agent["id"];
    save_db($db);
    ok(["token" => $issued, "agent" => ["id" => $agent["id"], "name" => $agent["name"], "rank" => $agent["rank"]], "db" => public_db($db)]);
}

$me = actor($db, (string)$token);
if (!$me) fail("Sesi tamat. Masuk semula.", 401);

if ($action === "state") {
    ok(["db" => public_db($db), "products" => visible_products($db, $me["rank"] === "rumah")]);
}

if ($action === "beli") {
    if ($me["rank"] !== "ejen") fail("Troli stok ini untuk ejen.");
    $lines = $body["lines"] ?? [];
    if (!is_array($lines) || count($lines) === 0) fail("Troli kosong.");
    $map = [];
    foreach ($db["products"] as $product) {
        $map[$product["id"]] = $product;
    }
    $clean = [];
    foreach ($lines as $line) {
        $id = (string)($line["productId"] ?? "");
        $qty = (int)($line["qty"] ?? 0);
        if (!isset($map[$id]) || $qty < 1 || $qty > 400) fail("Kuantiti tidak sah.");
        $clean[] = ["productId" => $id, "qty" => $qty];
    }
    $priced = quote($clean, $map);
    $at = gmdate("c");
    $receiptId = uid();
    foreach ($clean as $line) {
        $db["orders"][] = [
            "id" => uid(),
            "receiptId" => $receiptId,
            "buyerId" => $me["id"],
            "productId" => $line["productId"],
            "price" => unit_price($map[$line["productId"]], $priced["tier"]),
            "qty" => $line["qty"],
            "source" => "rumah",
            "supplierId" => null,
            "tier" => $priced["tier"],
            "status" => "menunggu-bayaran",
            "at" => $at,
        ];
    }
    save_db($db);
    ok(["tier" => $priced["tier"], "total" => $priced["total"], "receiptId" => $receiptId, "db" => public_db($db)]);
}

if ($action === "sahkan") {
    if ($me["rank"] !== "rumah") fail("Hanya rumah yang mengesahkan bayaran syarikat.");
    $receiptId = (string)($body["receiptId"] ?? "");
    $found = false;
    foreach ($db["orders"] as &$order) {
        if ($order["receiptId"] === $receiptId && $order["status"] === "menunggu-bayaran" && $order["source"] === "rumah") {
            $order["status"] = "disahkan";
            $found = true;
        }
    }
    unset($order);
    if (!$found) fail("Resit menunggu tidak dijumpai.");
    save_db($db);
    ok(["db" => public_db($db)]);
}

if ($action === "hantar") {
    if ($me["rank"] !== "rumah") fail("Hanya rumah yang menandakan penghantaran.");
    $id = (string)($body["orderId"] ?? "");
    $found = false;
    foreach ($db["dropships"] as &$order) {
        if ($order["id"] === $id) {
            $order["status"] = "dihantar";
            $found = true;
        }
    }
    unset($order);
    if (!$found) fail("Pesanan tidak dijumpai.");
    save_db($db);
    ok(["db" => public_db($db)]);
}

fail("Tindakan tidak dikenali.");
