<html lang="en">
<head>
    <title>Save Playlist</title>
</head>

<body>

    <?php

    echo '<p>Saving playlist...</p>';

    if (isset($_GET['name'])) {
        $name = $_GET['name'];
    } elseif (isset($_POST['name'])) {
        $name = $_POST['name'];
    } else {
        die('No Name Specified!');
    }
    $file = 'playlists/'.$name;

    if (isset($_GET['pstr'])) {
        $pstr = $_GET['pstr'];
    } elseif (isset($_POST['pstr'])) {
        $pstr = $_POST['pstr'];
    } else {
        die('No Contents Given!');
    }
    $contents = json_decode($pstr);

    echo '<p>Of name '.$name.' to file '.$file.' with contents: </p>';
    print_r($contents);

    $output = fopen($file, 'w');
    fwrite($output, "{\n");
    $i = 0;
    $c = count($contents);
    foreach ($contents as $index => $song) {

        fwrite($output, "\t\t\"".str_replace('"','\"',$index)."\": {\n");
        fwrite($output, "\t\t\t\"src\":\"".str_replace('"','\"',$song->src)."\",\n\t\t\t\"track\":\"".str_replace('"','\"',$song->track)."\",\n\t\t\t\"title\":\"".str_replace('"','\"',$song->title)."\",\n\t\t\t\"artist\":\"".str_replace('"','\"',$song->artist)."\",\n\t\t\t\"album\":\"".str_replace('"','\"',$song->album)."\",\n\t\t\t\"album_artist\":\"".str_replace('"','\"',$song->album_artist)."\"\n");

        if ($i == $c - 1) {
            fwrite($output, "\t\t}\n");
        } else {
            fwrite($output, "\t\t},\n");
        }
        $i++;
    }
    fwrite($output, "\t}");
    fclose($output);

    echo '<p>Playlist saved!</p>';

    ?>

</body>

</html>
