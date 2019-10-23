
//audio.js

//song object:
//  { src: src, track: track, title: title, artist: artist,
//    album: album, album_artist: album_artist }

var currentSong = 0;    //playlist index of the currently playing song
var audioPlayer;        //primary audio player object for playing music
var audioPreloader;     //second audio player object for preloading music
var playhead;           //range input object used as the playhead
var volume;             //range input object used as the volume slider
var mute;               //checkbox used to mute the audio
var playlist = [];      //mutable array of song objects in play queue
var browserFrame;       //stores a reference to the browser frame


function initPlayer() {
//initializes objects to point to the appropriate html elements
//and adds event listeners for audio players

    audioPlayer = document.getElementById('audioPlayer1');
    audioPreloader = document.getElementById('audioPlayer2');
    playhead = document.getElementById('playhead');
    volume = document.getElementById('volume');
    mute = document.getElementById('mute');
    browserFrame = parent.document.getElementById('browser').contentWindow;

    audioPlayer.addEventListener('ended', auto_advance);
    audioPlayer.addEventListener('pause', set_play_icon);
    audioPlayer.addEventListener('play', set_pause_icon);
	audioPlayer.addEventListener('durationchange', set_duration);
    audioPreloader.addEventListener('ended', auto_advance);
    audioPreloader.addEventListener('pause', set_play_icon);
    audioPreloader.addEventListener('play', set_pause_icon);
	audioPreloader.addEventListener('durationchange', set_duration);

    playhead.addEventListener('input', move_playhead);
    volume.addEventListener('input', set_volume);
    mute.addEventListener('change', set_mute);
    setInterval(update_playhead, 1000);
	
	set_volume();
	set_mute();
}


function play_pause() {
//plays or pauses the audioPlayer depending on its current state

    if (playlist.length > 0) {
        if (audioPlayer.readyState == 0) {
            play(0);
        } else if (audioPlayer.paused) {
            audioPlayer.play();
        } else {
            audioPlayer.pause();
        }
    }
}


function previous() {
//plays the previous song in the playlist

    if (playlist.length > 0) {
        if (currentSong == 0) {
            play(playlist.length - 1);
        } else {
            play(currentSong - 1);
        }
    }
}


function next() {
//plays the next song in the playlist

    if (playlist.length > 0) {
        if (currentSong == playlist.length - 1) {
            play(0);
        } else {
            play(currentSong + 1);
        }
    }
}


function shuffle() {
//shuffles remaining items in the playlist

    var played = playlist.slice(0, currentSong + 1);
    var remaining = playlist.slice(currentSong + 1);

    remaining.sort(function(a, b){return 0.5 - Math.random()});
    playlist = played.concat(remaining);

    updateCurrent();
    updateList();
}


function addSong(song) {
//adds a song object to the playlist

    playlist.push(song);

	updateList();
	
    if (audioPlayer.paused)
        play(playlist.length - 1);
}


function addAlbum(album) {
//adds an album to the playlist
//album is an array or dictionary of song objects

    first = playlist.length;

    for (var index in album)
        playlist.push(album[index]);
	
	updateList();

    if (audioPlayer.paused)
        play(first);
}


function addArtist(artist) {
//adds an artist to the playlist
//artist is an array or dictionary of albums that
//are arrays or dictionaries of of song objects

    first = playlist.length;

    for (var album in artist)
        for (var index in artist[album])
            playlist.push(artist[album][index]);
		
	updateList();

    if (audioPlayer.paused)
        play(first);
}


function deleteItem(index) {
//removes the song at index from the playlist

    if (index == currentSong) {
        if (playlist.length == 1) {
            clearPlaylist();
        } else {
            next();
        }
    }

    playlist.splice(index,1);

    updateCurrent();
    updateInfo();
    updateList();
}


function moveUp(index) {
//move the song at index in the playlist up one position

    if (index > 0) {

        var tmp = playlist[index - 1];
        playlist[index - 1] = playlist[index];
        playlist[index] = tmp;

        updateCurrent();
        updateList();
    }
}


function moveDown(index) {
//move the song at index in the playlist down one position

    if (index < (playlist.length - 1)) {

        var tmp = playlist[index + 1];
        playlist[index + 1] = playlist[index];
        playlist[index] = tmp;

        updateCurrent();
        updateList();
    }
}


function clearPlaylist() {
//resets the playlist, players, and controls to their default, empty states

    playlist = [];
    audioPlayer.src = '';
    audioPreloader.src = '';
    document.getElementById('playlistName').value = '';
    document.getElementById('currentTime').innerHTML = '--:--';
    document.getElementById('duration').innerHTML = '--:--';
    playhead.value = 0;
    playhead.max = 0;
    updateInfo();
    updateList();
}


function savePlaylist() {
//saves the current playlist to a file using the name in the playlistName element

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


function play(index) {
//swaps the audioPlayer and audioPreloader if the song has been preloaded,
//then plays the song at index in the playlist and preloads the next song
	
    if (arguments.length == 1) {

        currentSong = index;

        if (encodeURI(playlist[currentSong].src) == audioPreloader.src.substr(audioPreloader.src.indexOf('/jones')+6)) {
			
			audioPlayer.pause();
			audioPlayer.currentTime = 0;
			
            var tmp = audioPlayer;
            audioPlayer = audioPreloader;
            audioPreloader = tmp;
            audioPlayer.play();

        } else {

            audioPlayer.src = '/jones'+playlist[currentSong].src;
			audioPlayer.play();
        }

        if (currentSong + 1 < playlist.length)
            audioPreloader.src = '/jones'+playlist[currentSong + 1].src;

        updateInfo();
        updateList();
		set_duration();
    }
}


function updateInfo() {
//updates the information paragraph with the data from the current song

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
                   '<u>Artist</u>: <a href="javascript:void(0)" onclick="browserFrame.showArtist(\''+song.album_artist+'\')">'+song.artist+'</a><br>'+
                   '<u>Album</u>: <a href="javascript:void(0)" onclick="browserFrame.showAlbum(\''+song.album_artist+'\',\''+song.album+'\')">'+song.album+'</a><br>';
    }

    document.getElementById('nowPlayingInfo').innerHTML = info;
}


function updateList() {
//updates the table containing the list of song in the playlist

    /*var list = '<colgroup>'+
               '<col style="width:12px">'+
               '<col style="width:38px">'+
               '<col style="width:38px">'+
               '<col style="width:38px">'+
               '<col>'+
               '</colgroup>';*/
    var list = '';

    for (var i = 0; i < playlist.length; i++) {
        list += '<li id="p'+i+'" draggable="true" ondragstart="drag(event)" ondrop="drop(event)" ondragover="dragover(event)" ondragenter="dragenter(event)" ondragleave="dragleave(event)"'+
                (i == currentSong ? ' class="current-song"' : '')+'>'+
                '<button class="ibtn" onclick="deleteItem('+i+')">X</button> '+
                '<a href="javascript:void(0)" onclick="play('+i+')">'+playlist[i].title+'</a></li>';
        /*list += '<tr id="p'+i+'" draggable="true" ondragstart="drag(event)" ondrop="drop(event)" ondragover="dragover(event)"><td id="p'+i+'"> | </td>'+
                '<td id="p'+i+'"><button class="ibtn" onclick="deleteItem('+i+')">X</button></td>'+
                '<td id="p'+i+'"><button class="ibtn" onclick="moveUp('+i+')">&#9650</button></td>'+
                '<td id="p'+i+'"><button class="ibtn" onclick="moveDown('+i+')">&#9660</button></td>'+
                '<td id="p'+i+'"'+(i == currentSong ? ' class="current-song"' : '')+'><a id="p'+i+'" href="javascript:void(0)" onclick="play('+i+')">'+playlist[i].title+'</a></td></tr>';*/
    }
    /*list += '<tr id="p'+playlist.length+'" ondrop="drop(event)" ondragover="dragover(event)">'+
            '<td id="p'+i+'" style="height:24px"></td><td id="p'+i+'" style="height:24px"></td>'+
            '<td id="p'+i+'" style="height:24px"></td><td id="p'+i+'" style="height:24px"></td>'+
            '<td id="p'+i+'" style="height:24px"></td></tr>';*/

    list += '<li id="p'+playlist.length+'" ondrop="drop(event)" ondragover="dragover(event)" ondragenter="dragenter(event)" ondragleave="dragleave(event)">';

    document.getElementById('playlist').innerHTML = list;
}


function updateCurrent() {
//sets currentSong to the index of playlist item
//that has the same src as the audioPlayer

    var curSrc = audioPlayer.src;

    currentSong = -1;
    for (var i = 0; i < playlist.length; i++) {

        if (encodeURI(playlist[i].src) == curSrc.substr(curSrc.indexOf('/jones')+6)) {

            currentSong = i;
            break;
        }
    }
}


function formatTime(s) {
//converts seconds to a string of minutes:seconds

    if (isNaN(s)) {
		return "--:--";
	} else {
		s = Math.round(s);
		m = Math.floor(s / 60);
		s = s % 60;
		m = m < 10 ? 0 + String(m) : String(m);
		s = s < 10 ? 0 + String(s) : String(s);
		return m + ":" + s;
	}
}


function auto_advance() {
//plays the next song with the song ends
//repeats the playlist if repeat is checked
//called by the audioPlayer ended event listener

    if ( ( currentSong == (playlist.length - 1) ) &&
         ( document.getElementById('repeat').checked) ) {
        play(0);
    } else {
        play(currentSong + 1);
    }
}


function set_pause_icon() {
//sets the play/pause icon to show a pause symbol
//called by the audioPlayer play event listener

    document.getElementById('play_pause').innerHTML = '<b>||</b>';
}


function set_play_icon() {
//sets the play/pause icon to show a play symbol
//called by the audioPlayer pause event listener

    document.getElementById('play_pause').innerHTML = '&#9658';
}


function set_duration() {
//updates the duration label to reflect the current song
//called by the audioPlayer durationchange event listener
	
	playhead.max = isNaN(audioPlayer.duration) ? 0 : audioPlayer.duration;
	document.getElementById('duration').innerHTML = formatTime(audioPlayer.duration);
}


function move_playhead() {
//sets the playback position of the audioPlayer and the currentTime label
//based on the user interaction with the playhead
//called by the playhead input event listener

    audioPlayer.currentTime = playhead.value;
    document.getElementById('currentTime').innerHTML = formatTime(audioPlayer.currentTime);
}


function update_playhead() {
//updates the position of the playhead and the currentTime label
//called on an interval

    if (!audioPlayer.paused) {
        playhead.value = audioPlayer.currentTime;
        document.getElementById('currentTime').innerHTML = formatTime(audioPlayer.currentTime);
    }
}


function set_volume() {
//sets the volume of the audioPlayer and the audioPreloader
//based on the user interaction with the volume slider
//called by the volume input event listener

    audioPlayer.volume = audioPreloader.volume = volume.value / 100.0;
}


function set_mute() {
//sets the mute state of the audioPlayer and the audioPreloader
//based on the user interaction with the volume slider
//called by the muted change event listener

    audioPlayer.muted = audioPreloader.muted = volume.disabled = mute.checked;
}


function drag(e) {
//drag function for playlist row elements
//records the id of the dragged item

    e.dataTransfer.setData("text/plain", e.target.id);
}


function drop(e) {
//drop function for playlist row elements
//sends the indices of the dragged element
//and the one it was dropped on to the move function

    e.preventDefault();
    var from = parseInt(e.dataTransfer.getData("text/plain").substring(1))
    var to = parseInt(e.target.id.substring(1))
    move(from, to);
}


function dragover(e) {
//dragover function for playlist row elements

    e.preventDefault();
}


function dragover(e) {
//dragover function for playlist row elements

    e.preventDefault();
}


function dragenter(e) {
    e.target.style.borderTop = "1px solid black";
}


function dragleave(e) {
    e.target.style.borderTop = "1px solid white";
}


function move(from, to) {
//places the playlist item at the from index above the
//item at the to index

    if (from < to && to < playlist.length) {
        p1 = playlist.slice(0, from);
        p2 = playlist.slice(from + 1, to);
        p3 = playlist.slice(to);
        playlist = p1.concat(p2, [playlist[from]], p3);

    } else if (to < from && from < playlist.length - 1) {
        p1 = playlist.slice(0, to);
        p2 = playlist.slice(to, from);
        p3 = playlist.slice(from + 1);
        playlist = p1.concat([playlist[from]], p2, p3);

    } else if (from < to && to == playlist.length) {
        p1 = playlist.slice(0, from);
        p2 = playlist.slice(from + 1);
        playlist = p1.concat(p2, [playlist[from]]);

    } else if (to < from && from == playlist.length - 1) {
        p1 = playlist.slice(0, to);
        p2 = playlist.slice(to, from);
        playlist = p1.concat([playlist[from]], p2);
    }

    updateCurrent();
    updateList();
}
