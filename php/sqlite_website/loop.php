<?php

$countries = ["Denmark", "brazil", "canada", "Argentina"];
$Count = count($countries);
echo "Count Countries: ";
echo $Count;
echo "\n";
echo "foreach loop \n";
foreach ($countries as $i => $country): ?>
<li>
 <article>
     <h1> <?php
     echo "\n";
     echo $i;
     ?>:<?php echo $country; ?> </h1>
 </article>loop.php
</li>
<?php endforeach;

echo "for loop \n";

for ($i = 0; $i < count($countries); $i += 1): ?>
<li>
 <article>
     <h1> <?php
     echo "\n";
     echo $i;
     ?>:<?php echo $countries[$i]; ?> </h1>
 </article>
</li>
<?php endfor;
?>
