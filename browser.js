
//browser.js


var library = [];
var playlists = [];
var currentView = 0;
var audioFrame;


function initBrowser() {

    audioFrame = parent.document.getElementById('player').contentWindow;

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            library = JSON.parse(this.responseText);
            updateTable();
        }
    };
    xhttp.open("POST", "loadfile.php", true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send("file=library.json");

    loadPlaylists();

    document.getElementById("query").onkeydown = function(e) {
        if (e.keyCode == 13) { search(); }
    };
}


function loadPlaylists() {

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            playlists = JSON.parse(this.responseText);
            if (currentView == 3) { updateTable(3); }
        }
    };
    xhttp.open("POST", "loadfile.php", true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send("file=playlists");
}


function updateTable(view) {

    if (arguments.length == 1) { currentView = view; }

    resetHeader();
    resetButtons();

    switch (currentView) {

        case 0: //artists

            document.getElementById("set_0").className = "btn active";

            var columns = '<colgroup>'+
                          '<col style="width:48px">'+
                          '<col style="width:48px">'+
                          '<col>'+
                          '</colgroup>';

            var tblhead = columns+
                          '<thead><tr>'+
                          '<th></th>'+
                          '<th></th>'+
                          '<th>Artist</th>'+
                          '</tr><thead>';

            tbldata = columns+'<tbody>';

            for (var artist in library) {
                obj = library[artist];
                str = html(JSON.stringify(obj));
                tbldata += '<tr><td><button class="ibtn" onclick="audioFrame.addArtist('+str+')">+</button></td>'+
                           '<td><button class="ibtn" onclick="audioFrame.clearPlaylist();audioFrame.addArtist('+str+')">&#9658</button></td>'+
                           '<td><a href="javascript:void(0)" onclick="showArtist(\''+artist+'\')">'+artist+'</a></td></tr>';
            }

            tbldata += '</tbody>';

            break;

        case 1: //albums

            document.getElementById("set_1").className = "btn active";

            var columns = '<colgroup>'+
                          '<col style="width:48px">'+
                          '<col style="width:48px">'+
                          '<col>'+
                          '<col>'+
                          '</colgroup>';

            var tblhead = columns+
                          '<thead><tr>'+
                          '<th></th>'+
                          '<th></th>'+
                          '<th>Album</th>'+
                          '<th>Artist</th>'+
                          '</tr></thead>';

            tbldata = columns+'<tbody>';

            for (var artist in library) {
                for (var album in library[artist]) {
                    obj = library[artist][album];
                    str = html(JSON.stringify(obj));
                    tbldata += '<tr><td><button class="ibtn" onclick="audioFrame.addAlbum('+str+')">+</button></td>'+
                               '<td><button class="ibtn" onclick="audioFrame.clearPlaylist();audioFrame.addAlbum('+str+')">&#9658</button></td>'+
                               '<td><a href="javascript:void(0)" onclick="showAlbum(\''+artist+'\',\''+album+'\')">'+album+'</a></td>'+
                               '<td><a href="javascript:void(0)" onclick="showArtist(\''+artist+'\')">'+artist+'</a></td></tr>';
                }
            }

            tbldata += '</tbody>';

            break;

        case 2: //songs

            document.getElementById("set_2").className = "btn active";

            var columns = '<colgroup>'+
                          '<col style="width:48px">'+
                          '<col style="width:48px">'+
                          '<col style="width:64px">'+
                          '<col>'+
                          '<col>'+
                          '<col>'+
                          '</colgroup>';

            var tblhead = columns+
                          '<thead><tr>'+
                          '<th></th>'+
                          '<th></th>'+
                          '<th>Track</th>'+
                          '<th>Title</th>'+
                          '<th>Album</th>'+
                          '<th>Artist</th>'+
                          '</tr></thead>';

            tbldata = columns+'<tbody>';

            for (var artist in library) {
                for (var album in library[artist]) {
                    for (var index in library[artist][album]) {
                        obj = library[artist][album][index];
                        str = html(JSON.stringify(obj));
                        tbldata += '<tr><td><button class="ibtn" onclick="audioFrame.addSong('+str+')">+</button></td>'+
                                   '<td><button class="ibtn" onclick="audioFrame.clearPlaylist();audioFrame.addSong('+str+')">&#9658</button></td>'+
                                   '<td>'+obj.track+'</td>'+
                                   '<td><a href="javascript:void(0)" onclick="audioFrame.clearPlaylist();audioFrame.addSong('+str+')">'+obj.title+'</a></td>'+
                                   '<td><a href="javascript:void(0)" onclick="showAlbum(\''+obj.album_artist+'\',\''+obj.album+'\')">'+obj.album+'</a></td>'+
                                   '<td><a href="javascript:void(0)" onclick="showArtist(\''+obj.album_artist+'\')">'+obj.artist+'</a></td></tr>';
                    }
                }
            }

            tbldata += '</tbody>';

            break;

        case 3: //playlists

            document.getElementById("set_3").className = "btn active";

            var columns = '<colgroup>'+
                          '<col style="width:48px">'+
                          '<col style="width:48px">'+
                          '<col>'+
                          '<col style="width:48px">'+
                          '</colgroup>';

            var tblhead = columns+
                          '<thead><tr>'+
                          '<th></th>'+
                          '<th></th>'+
                          '<th>Playlist</th>'+
                          '<th></th>'+
                          '</tr><thead>';

            tbldata = columns+'<tbody>';

            for (var playlist in playlists) {
                obj = playlists[playlist];
                str = html(JSON.stringify(obj));
                tbldata += '<tr><td><button class="ibtn" onclick="audioFrame.addAlbum('+str+')">+</button></td>'+
                           '<td><button class="ibtn" onclick="audioFrame.clearPlaylist();audioFrame.document.getElementById(\'playlistName\').value=\''+playlist+'\';audioFrame.addAlbum('+str+')">&#9658</button></td>'+
                           '<td><a href="javascript:void(0)" onclick="showPlaylist(\''+playlist+'\')">'+playlist+'</a></td>'+
                           '<td><button class="ibtn" onclick="deletePlaylist(\''+playlist+'\')">X</button></td></tr>';
            }

            tbldata += '</tbody>';

            break;

        default:

            var tblhead = '';
            var tbldata = 'This view has not been implemented yet.';
    }

    document.getElementById('tblhead').innerHTML = tblhead;
    document.getElementById('tbldata').innerHTML = tbldata;
}


function showArtist(artist) {

    resetButtons();

    document.getElementById("hback").style.height = "112px";
    document.getElementById("tblhead").style.top = "80px";
    document.getElementById("tbldata").style.marginTop = "112px";

    str = html(JSON.stringify(library[artist]));
    var info = '<button class="ibtn" onclick="audioFrame.addArtist('+str+')">+</button> '+
               '<button class="ibtn" onclick="audioFrame.clearPlaylist();audioFrame.addArtist('+str+')">&#9658</button> '+
               '<b>'+artist+'</b>';

    var columns = '<colgroup>'+
                  '<col style="width:48px">'+
                  '<col style="width:48px">'+
                  '<col style="width:64px">'+
                  '<col>'+
                  '<col>'+
                  '</colgroup>';

    var tblhead = columns+
                  '<thead><tr>'+
                  '<th></th>'+
                  '<th></th>'+
                  '<th>Track</th>'+
                  '<th>Title</th>'+
                  '<th>Album</th>'+
                  '</tr></thead>';

    tbldata = columns+'<tbody>';
    for (var album in library[artist]) {
        for (var index in library[artist][album]) {
            obj = library[artist][album][index];
            str = html(JSON.stringify(obj));
            tbldata += '<tr><td><button class="ibtn" onclick="audioFrame.addSong('+str+')">+</button></td>'+
                       '<td><button class="ibtn" onclick="audioFrame.clearPlaylist();audioFrame.addSong('+str+')">&#9658</button></td>'+
                       '<td>'+obj.track+'</td>'+
                       '<td><a href="javascript:void(0)" onclick="audioFrame.clearPlaylist();audioFrame.addSong('+str+')">'+obj.title+'</a>'+
                       (artist != obj.artist ? ' - <i>'+obj.artist+'</i>' : '')+'</td>'+
                       '<td><a href="javascript:void(0)" onclick="showAlbum(\''+obj.album_artist+'\',\''+obj.album+'\')">'+obj.album+'</a></td></tr>';
        }
    }
    tbldata += '</tbody>';

    document.getElementById('info').innerHTML = info;
    document.getElementById('tblhead').innerHTML = tblhead;
    document.getElementById('tbldata').innerHTML = tbldata;
}


function showAlbum(artist,album) {

    resetButtons();

    document.getElementById("hback").style.height = "112px";
    document.getElementById("tblhead").style.top = "80px";
    document.getElementById("tbldata").style.marginTop = "112px";

    str = html(JSON.stringify(library[artist][album]));
    var info = '<button class="ibtn" onclick="audioFrame.addAlbum('+str+')">+</button> '+
               '<button class="ibtn" onclick="audioFrame.clearPlaylist();audioFrame.addAlbum('+str+')">&#9658</button> '+
               '<b>'+album+'</b><br><a href="javascript:void(0)" onclick="showArtist(\''+artist+'\')">'+artist+'</button>';

    var columns = '<colgroup>'+
                  '<col style="width:48px">'+
                  '<col style="width:48px">'+
                  '<col style="width:64px">'+
                  '<col>'+
                  '</colgroup>';

    var tblhead = columns+
                  '<thead><tr>'+
                  '<th></th>'+
                  '<th></th>'+
                  '<th>Track</th>'+
                  '<th>Title</th>'+
                  '</tr></thead>';

    tbldata = columns+'<tbody>';
    for (var index in library[artist][album]) {
        obj = library[artist][album][index];
        str = html(JSON.stringify(obj));
        tbldata += '<tr><td><button class="ibtn" onclick="audioFrame.addSong('+str+')">+</button></td>'+
                   '<td><button class="ibtn" onclick="audioFrame.clearPlaylist();audioFrame.addSong('+str+')">&#9658</button></td>'+
                   '<td>'+obj.track+'</td>'+
                   '<td><a href="javascript:void(0)" onclick="audioFrame.clearPlaylist();audioFrame.addSong('+str+')">'+obj.title+'</a>'+
                   (artist != obj.artist ? ' - <i>'+obj.artist+'</i>' : '')+'</td></tr>';
    }
    tbldata += '</tbody>';

    document.getElementById('info').innerHTML = info;
    document.getElementById('tblhead').innerHTML = tblhead;
    document.getElementById('tbldata').innerHTML = tbldata;
}


function showPlaylist(playlist) {

    resetButtons();

    document.getElementById("hback").style.height = "112px";
    document.getElementById("tblhead").style.top = "80px";
    document.getElementById("tbldata").style.marginTop = "112px";

    str = html(JSON.stringify(playlists[playlist]));
    var info = '<button class="ibtn" onclick="audioFrame.addAlbum('+str+')">+</button> '+
               '<button class="ibtn" onclick="audioFrame.clearPlaylist();audioFrame.document.getElementById(\'playlistName\').value=\''+playlist+'\';audioFrame.addAlbum('+str+')">&#9658</button> '+
               '<b>'+playlist+'</b>';

    var columns = '<colgroup>'+
                  '<col style="width:48px">'+
                  '<col style="width:48px">'+
                  '<col style="width:64px">'+
                  '<col>'+
                  '<col>'+
                  '<col>'+
                  '</colgroup>';

    var tblhead = columns+
                 '<thead><tr>'+
                 '<th></th>'+
                 '<th></th>'+
                 '<th>Track</th>'+
                 '<th>Title</th>'+
                 '<th>Album</th>'+
                 '<th>Artist</th>'+
                 '</tr></thead>';

    tbldata = columns+'<tbody>';

    for (var index in playlists[playlist]) {
        obj = playlists[playlist][index];
        str = html(JSON.stringify(obj));
        tbldata += '<tr><td><button class="ibtn" onclick="audioFrame.addSong('+str+')">+</button></td>'+
                   '<td><button class="ibtn" onclick="audioFrame.clearPlaylist();audioFrame.addSong('+str+')">&#9658</button></td>'+
                   '<td>'+obj.track+'</td>'+
                   '<td><a href="javascript:void(0)" onclick="audioFrame.clearPlaylist();audioFrame.addSong('+str+')">'+obj.title+'</a></td>'+
                   '<td><a href="javascript:void(0)" onclick="showAlbum(\''+obj.album_artist+'\',\''+obj.album+'\')">'+obj.album+'</a></td>'+
                   '<td><a href="javascript:void(0)" onclick="showArtist(\''+obj.album_artist+'\')">'+obj.artist+'</a></td></tr>';
    }

    document.getElementById('info').innerHTML = info;
    document.getElementById('tblhead').innerHTML = tblhead;
    document.getElementById('tbldata').innerHTML = tbldata;
}


function search() {

    var query = document.getElementById("query").value;

    if (query != '') {

        resetHeader();
        resetButtons();

        var r = new RegExp(query,"i");

        var columns = '<colgroup>'+
                      '<col style="width:48px">'+
                      '<col style="width:48px">'+
                      '<col style="width:64px">'+
                      '<col>'+
                      '<col>'+
                      '<col>'+
                      '</colgroup>';

        var tblhead = columns+
                      '<thead><tr>'+
                      '<th></th>'+
                      '<th></th>'+
                      '<th>Track</th>'+
                      '<th>Title</th>'+
                      '<th>Album</th>'+
                      '<th>Artist</th>'+
                      '</tr></thead>';

        tbldata = columns+'<tbody>';
        for (var artist in library) {
            for (var album in library[artist]) {
                for (var index in library[artist][album]) {
                    obj = library[artist][album][index];
                    if (r.test(obj.title) || r.test(obj.artist) || r.test(obj.album)) {
                        str = html(JSON.stringify(obj));
                        tbldata += '<tr><td><button class="ibtn" onclick="audioFrame.addSong('+str+')">+</button></td>'+
                                   '<td><button class="ibtn" onclick="audioFrame.clearPlaylist();audioFrame.addSong('+str+')">&#9658</button></td>'+
                                   '<td>'+obj.track+'</td>'+
                                   '<td><a href="javascript:void(0)" onclick="audioFrame.clearPlaylist();audioFrame.addSong('+str+')">'+obj.title+'</a></td>'+
                                   '<td><a href="javascript:void(0)" onclick="showAlbum(\''+obj.album_artist+'\',\''+obj.album+'\')">'+obj.album+'</a></td>'+
                                   '<td><a href="javascript:void(0)" onclick="showArtist(\''+obj.album_artist+'\')">'+obj.artist+'</a></td></tr>';
                    }
                }
            }
        }
        tbldata += '</tbody>';

        document.getElementById('tblhead').innerHTML = tblhead;
        document.getElementById('tbldata').innerHTML = tbldata;
    }
}


function resetHeader() {

    document.getElementById("info").innerHTML = "";
    document.getElementById("hback").style.height = "72px";
    document.getElementById("tblhead").style.top = "40px";
    document.getElementById("tbldata").style.marginTop = "72px";
}


function resetButtons() {

    document.getElementById("set_0").className = "btn";
    document.getElementById("set_1").className = "btn";
    document.getElementById("set_2").className = "btn";
    document.getElementById("set_3").className = "btn";
}


function deletePlaylist(playlist) {

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            loadPlaylists();
            updateTable(3);
        }
    };
    xhttp.open("POST", "deleteplaylist.php", true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send("name="+playlist);
}


function html(str) {

    if (typeof(str) == "string") {
        str = str.replace(/&/g, "&amp;");
        str = str.replace(/"/g, "&quot;");
        str = str.replace(/'/g, "&#039;");
        str = str.replace(/</g, "&lt;");
        str = str.replace(/>/g, "&gt;");
    }
    return str;
}
