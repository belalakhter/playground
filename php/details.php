
<?php include "header_inc.php"; ?>
<?php
include "classes.php";
$db = new DB();
$exhibits = $db->execute("SELECT * FROM items");
$index = $_GET["index"] ?? 0;
$exhibit = $exhibits[$index];
$img = $exhibit["image"];
?>
<article>
    <h2><?php
    echo "Title: ";
    echo $exhibit["title"];
    ?></h2>
    <h2><?php
    echo "Id: ";
    echo $exhibit["id"];
    ?></h2>
    <h2><?php echo "Image: "; ?>
    <img src="<?php echo $img; ?>"
        fetchpriority="high"
        decoding="sync"
        alt="Exhibit image" />
</h2>


</article>
<?php include "footer_inc.php"; ?>
