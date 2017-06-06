<?php 

$name = $_POST["name"];

file_put_contents("../database/usersss.json", $name);

return true;

?>