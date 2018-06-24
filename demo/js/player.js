import LrcPlayer from './lrcplayer.js'

const Player = (function () {
    /**
     * Player Controller
     * @param {container: DomElement} options 
     */
    const _Player = function (options) {
        let { container, player, controls, lrc } = options;
        const audioID = "__Player__Audio__";
        if (!player) {
            player = document.createElement("audio");
            player.setAttribute('id', audioID);
            if (controls === true) {
                player.setAttribute('controls', 'controls');
            }
            container.appendChild(player);
        }
        if (!lrc) {
            lrc = LrcPlayer.create({
                audioEl: player
            });
        }


        this.play = (src) => {
            player.setAttribute('src', src);
            player.play();
            lrc.load(src.replace('.mp3', '.lrc'));
        };
        this.playOrPause = () => {
            player[player.paused ? 'play' : 'pause']();

        }
        this.player = player;
        this.lrc = lrc;


    }

    return _Player;
})();

export default Player;
