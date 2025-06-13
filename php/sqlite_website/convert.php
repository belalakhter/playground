
<html>
    <body>
        <h2>Conversion Result</h2>
        <?php
        include_once "classes/convertor.php";
        $browserUA = $_SERVER["HTTP_USER_AGENT"];
        $amount = $_GET["amount"];
        $crypto = $_GET["crypto"];
        if (!empty($amount) && !empty($crypto)) {
            $convertor = new CryptoConvertor($crypto);
            $result = $convertor->Convert($amount);
            echo "<p>You want to convert $amount USD from $crypto. </p>";
            echo "<p>Result is $result</p>";
        } else {
            echo "<p>Try Again. </p>";
        }
        ?>
    </body>
</html>
