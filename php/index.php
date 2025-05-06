<!-- <!DOCTYPE html>
<title>Crypto Masters</title>
<h1>Crypto Masters</h1>
<form action="convert.php">
<label for="amount">Amount</label>
<input id="amount" name="amount">
<label for="crypto">CryptoCurrency</label>
<select  id="crypto" name="crypto">
    <option>BTC</option>
    <option>ETH</option>
</select>
<button type="submit">Convert</button>
</form> -->
<?php include "header_inc.php"; ?>
<html lang="en">

    <body style="background-color: green; color: white;">
        <main>
            <?php
            include "classes.php";
            $db = new DB();
            $exhibits = $db->execute("SELECT * FROM items");
            foreach ($exhibits as $i => $object): ?>
                <article>
                    <h2>
                        <a style="color: white;" href="details.php?index=<?php echo $i; ?>">
                            <?php
                            echo "=> ";
                            echo $object["title"];
                            ?>
                        </a>
                    </h2>
                </article>
            <?php endforeach;
            ?>
        </main>

    </body>
</html>
<?php include "footer_inc.php"; ?>
