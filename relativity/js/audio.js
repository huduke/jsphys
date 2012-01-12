"use strict";

function AudioManager() {
    this.tracks = {};
    this.currentTrack = null;
}

/**
 * The AudioManager implements a queueing system to be used for audio narration
 * of demos. Objects can load media files which should be played, and when those
 * objects decide the media should be played (based on time, a button, or
 * whatever), they call `play`.
 */
AudioManager.prototype = {
    /**
     * Load a track so it will be ready to play in advance.
     */
    load: function(track) {
        var a = document.createElement('audio');
        a.setAttribute('src', 'demos/audio/' + track + '.ogg');
        a.load();
        this.tracks[track] = a;
    },
    
    play: function(track) {
        if (!(track in this.tracks)) {
            throw "Track cannot be played before being loaded.";
        }
        this.tracks[track].addEventListener("ended", function() {
           this.currentTrack = false; 
        });
        this.tracks[track].play();
        this.currentTrack = track;
    }
};