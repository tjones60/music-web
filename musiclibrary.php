<?php

class Song {

    private $src;
    private $track;
    private $title;
    private $artist;
    private $album;
    private $album_artist;

    function __construct($src, $track, $title, $artist, $album, $album_artist) {

        $this->src = $src;
        $this->track = $track;
        $this->title = $title;
        $this->artist = $artist;
        $this->album = $album;
        $this->album_artist = $album_artist;
    }

    function __toString() {

        return "\t\t\t\t\"src\":\"".str_replace('"','\"',$this->src)."\",\n"
              ."\t\t\t\t\"track\":\"".str_replace('"','\"',$this->track)."\",\n"
              ."\t\t\t\t\"title\":\"".str_replace('"','\"',$this->title)."\",\n"
              ."\t\t\t\t\"artist\":\"".str_replace('"','\"',$this->artist)."\",\n"
              ."\t\t\t\t\"album\":\"".str_replace('"','\"',$this->album)."\",\n"
              ."\t\t\t\t\"album_artist\":\"".str_replace('"','\"',$this->album_artist)."\"\n";

    }
}

if (count($argv) == 3) {

    $dir = $argv[1];
    $file = $argv[2];

    exec('mediainfo --Inform="General;%CompleteName%\n%Track/Position%\n%Title%\n%Artist%\n%Album%\n%Album/Performer%\n" '.$dir, $songs);
    $lib = array();


    for ($i = 0; $i < (count($songs) - 6); $i += 6) {

        $src = $songs[$i];
        $track = $songs[$i+1];
        $title = $songs[$i+2];
        $artist = $songs[$i+3];
        $album = $songs[$i+4];
        $album_artist = $songs[$i+5];

        if ($title == '' || $title == '-') { $title = basename($src); }
        if ($album_artist == '') { $album_artist = $artist; }
        if ($album_artist == '') { $album_artist = 'Unknown Artist'; }
        if ($album == '') { $album = 'Unknown Album'; }

        if (!isset($lib[$album_artist])) { $lib[$album_artist] = array(); }
        if (!isset($lib[$album_artist][$album])) { $lib[$album_artist][$album] = array(); }

        if ($track == '') { $track = (string) count($lib[$album_artist][$album]); }

        $obj = new Song($src, $track, $title, $artist, $album, $album_artist);

        array_push($lib[$album_artist][$album], $obj);
    }


    ksort($lib);
    $output = fopen($file, 'w');
    fwrite($output, "{\n");


    $i = 0;
    $c = count($lib);
    foreach ($lib as $artist => $albums) {

        ksort($albums);

        fwrite($output, "\t\"".str_replace('"','\"',$artist)."\": {\n");

        $ii = 0;
        $cc = count($albums);
        foreach ($albums as $album => $songs) {

            ksort($songs);

            fwrite($output, "\t\t\"".str_replace('"','\"',$album)."\": {\n");

            $iii = 0;
            $ccc = count($songs);
            foreach ($songs as $track => $song) {

                fwrite($output, "\t\t\t\"".str_replace('"','\"',$track)."\": {\n");
                fwrite($output, (string) $song);

                if ($iii == $ccc - 1) {
                    fwrite($output, "\t\t\t}\n");
                } else {
                    fwrite($output, "\t\t\t},\n");
                }
                $iii++;
            }
            if ($ii == $cc - 1) {
                fwrite($output, "\t\t}\n");
            } else {
                fwrite($output, "\t\t},\n");
            }
            $ii++;
        }
        if ($i == $c - 1) {
            fwrite($output, "\t}\n");
        } else {
            fwrite($output, "\t},\n");
        }
        $i++;
    }
    fwrite($output, "}\n");
    fclose($output);

} else {
    echo "Invalid arguments. Use \"<dir>\" \"<file>\".\n";
}

?>
