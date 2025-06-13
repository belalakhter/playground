<?php
class DB
{
    function execute($query)
    {
        $db = new SQLite3("data/database.db");
        $query = "SELECT * FROM items";
        $result = $db->query($query);
        $all = [];
        while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
            $all[] = $row;
        }

        return $all;
    }
}

?>
