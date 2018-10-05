<html lang="en">
<head>
    <title>Delete Playlist</title>
</head>

<body>

    <?php

    echo '<p>Deleting playlist...</p>';

    $name = $_POST['name'];
    $file = 'playlists/'.$name;

    echo '<p>Of name '.$name.' in file '.$file.'</p>';

    unlink($file) or die('Could not delete file.');

    echo '<p>Playlist deleted!</p>';
    
    ?>

</body>

</html>
