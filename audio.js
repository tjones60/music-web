
//audio.js

//public variables

var currentSong;
var audioPlayer;
if (typeof playlist === 'undefined') { var playlist = []; }

//public functions

function initPlayer() {

    currentSong = 0;
    audioPlayer = document.getElementById('audioPlayer');

    if (playlist.length > 0) {

        play();

    } else if (typeof meta !== 'undefined' && meta.length > 0) {

        processMeta();
        play();
    }

    audioPlayer.addEventListener('ended', function() {

        if ( ( currentSong == (playlist.length - 1) ) &&
             ( document.getElementById('repeat').checked == true) ) {

            play(0);

        } else {

            currentSong++;
            play();
        }
    });

    audioPlayer.addEventListener('pause', function() {

        document.getElementById('play_pause').innerHTML = 'Play';
    });

    audioPlayer.addEventListener('play', function() {

        document.getElementById('play_pause').innerHTML = 'Pause';
    });
}


function play_pause() {

    if (playlist.length > 0) {

        if (audioPlayer.readyState == 0) {

            currentSong = 0;
            audioPlayer.src = '/jones'+playlist[currentSong].src;
            audioPlayer.play();

        } else if (audioPlayer.paused) {

            audioPlayer.play();

        } else {

            audioPlayer.pause();
        }
    }
}


function previous() {

    if (playlist.length > 0) {

        if (currentSong == 0) { currentSong = playlist.length - 1; }
        else { currentSong--; }

        play();
    }
}


function next() {

    if (playlist.length > 0) {

        if (currentSong == playlist.length - 1) { currentSong = 0; }
        else { currentSong++; }

        play();
    }
}


function shuffle() {

    var played = playlist.slice(0, currentSong + 1);
    var remaining = playlist.slice(currentSong + 1);

    remaining.sort(function(a, b){return 0.5 - Math.random()});
    playlist = played.concat(remaining);

    updateCurrent();
    updateList();
}


function addSong(song) {

    playlist.push(song);

    if (audioPlayer.paused) {
        play(playlist.length - 1);
    } else {
        preload(playlist.length - 1);
    }
}


function addAlbum(album) {

    var i = 0;
    for (var index in album) {

        playlist.push(album[index]);

        if (audioPlayer.paused && i == 0) {
            play(playlist.length - 1);
        } else {
            preload(playlist.length - 1);
        }
        i++;
    }
}


function addArtist(artist) {

    var i = 0;
    for (var album in artist) {
        for (var index in artist[album]) {

            playlist.push(artist[album][index]);

            if (audioPlayer.paused && i == 0) {
                play(playlist.length - 1);
            } else {
                preload(playlist.length - 1);
            }
            i++;
        }
    }
}


function deleteItem(index) {

    if (index == currentSong) {

        if (playlist.length == 1) {
            audioPlayer.src = '';
        } else { next(); }
    }

    playlist.splice(index,1);

    updateCurrent();
    updateInfo();
    updateList();
}


function moveUp(index) {

    if (index > 0) {

        var tmp = playlist[index - 1];
        playlist[index - 1] = playlist[index];
        playlist[index] = tmp;

        updateCurrent();
        updateList();
    }
}


function moveDown(index) {

    if (index < (playlist.length - 1)) {

        var tmp = playlist[index + 1];
        playlist[index + 1] = playlist[index];
        playlist[index] = tmp;

        updateCurrent();
        updateList();
    }
}


function clearPlaylist() {

    playlist = [];
    audioPlayer.src = '';
    document.getElementById('playlistName').value = '';
    updateInfo();
    updateList();
}


function savePlaylist() {

    var playlistName = encodeURIComponent(document.getElementById('playlistName').value);
    var playlistStr = encodeURIComponent(JSON.stringify(playlist));
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            parent.document.getElementById('browser').contentWindow.loadPlaylists();
        }
    };
    xhttp.open('POST', 'saveplaylist.php', true);
    xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhttp.send('name='+playlistName+'&pstr='+playlistStr);
}

//private functions

function play(index) {

    if (arguments.length == 1) { currentSong = index; }
    audioPlayer.src = '/jones'+playlist[currentSong].src;
    audioPlayer.play();
    document.getElementById('play_pause').innerHTML = 'Pause';

    updateInfo();
    updateList();
}


function preload(index) {

    /*var preloader = new Audio();
    preloader.src = '/jones'+playlist[index].src;*/

    updateList();
}


function processMeta() {

    for (var i = 0; i < meta.length / 5; i++) {

        playlist.push( { src:meta[i*5],    track:meta[i*5+1],
                        title:meta[i*5+2], artist:meta[i*5+3],
                        album:meta[i*5+4] } );
    }

    updateList();
}


function updateInfo() {

    if (playlist[currentSong] == undefined) {

        info = '<b>Now Playing</b><br>'+
               '<u>Track</u>: <br>'+
               '<u>Title</u>: <br>'+
               '<u>Artist</u>: <br>'+
               '<u>Album</u>: <br>';

    } else {

        var song = playlist[currentSong];

        var info = '<b>Now Playing</b><br>'+
        '<u>Track</u>: '+song.track+'<br>'+
        '<u>Title</u>: '+song.title+'<br>'+
        '<u>Artist</u>: <a href="javascript:void(0)" onclick="parent.document.getElementById(\'browser\').contentWindow.showArtist(\''+song.album_artist+'\')">'+song.artist+'</a><br>'+
        '<u>Album</u>: <a href="javascript:void(0)" onclick="parent.document.getElementById(\'browser\').contentWindow.showAlbum(\''+song.album_artist+'\',\''+song.album+'\')">'+song.album+'</a><br>';
    }

    document.getElementById('nowPlayingInfo').innerHTML = info;
}


function updateList() {

    var list = '';

    for (var i = 0; i < playlist.length; i++) {

        list += '<tr><td><button class="ibtn" onclick="deleteItem('+i+')">X</button></td>';
        list += '<td><button class="ibtn" onclick="moveUp('+i+')">&#9650</button></td>';
        list += '<td><button class="ibtn" onclick="moveDown('+i+')">&#9660</button></td><td';
        if (i == currentSong) { list += ' class="current-song" '; }
        list += '><a href="javascript:void(0)" onclick="play('+i+')">';
        list += playlist[i].title+'</a></td></tr>';
    }

    document.getElementById('playlist').innerHTML = list;
}


function updateCurrent() {

    var curSrc = audioPlayer.src;

    currentSong = -1;
    for (var i = 0; i < playlist.length; i++) {

        if (encodeURI(playlist[i].src) == curSrc.substr(curSrc.indexOf('/jones')+6)) {

            currentSong = i;
            break;
        }
    }
}
