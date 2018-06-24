const searchRegex = /\[(\d{2,}):(\d{2,})(\.(\d{2,3}))?\]/g;
const tagsRegex = /\[(ti|ar|al|by):(.*)?\]/gm;
const findCurrentLine = (currentTime, lines) => {
    let foundIndex = 0;
    lines.every((line, index) => {
        if (currentTime <= line.time) {
            foundIndex = index;
            return false;
        }
        return true;
    });
    return foundIndex - 1;
};

const htmlEncode = (html) => {
    let temp = document.createElement('div');
    if (temp.textContent !== undefined) {
        (temp.textContent = html);
    } else { (temp.innerText = html); }
    const output = temp.innerHTML;
    temp = null;
    return output;
};

class LrcPlayer {
    constructor(options) {
        const ctrID = '__Player__LRC__';
        const { container, audioEl, style } = options;
        if (audioEl) {
            this.audioEl = audioEl;
        }
        if (!container) {
            this.container = document.createElement('div');
            this.container.setAttribute('id', ctrID);
            document.body.appendChild(this.container);
        } else {
            this.container = container;
        }
        this.lrcBodyEl = document.createElement('div');
        this.container.appendChild(this.lrcBodyEl);
        const rect = this.container.getBoundingClientRect();
        this.halfCtrHeight = (rect.bottom - rect.top) / 2;
        this.style = style || 'default';
        // reduce border height??
    }

    static create(options) { return new LrcPlayer(options || {}); }
}

Object.assign(LrcPlayer.prototype, {
    lastEl: null,
    lastIndex: -1,
    setStartCls() {
        this.lrcBodyEl.style.transition = 'transform 0.1s ease-out';
        this.lrcBodyEl.style.transform = `translateY(${this.halfCtrHeight}px)`;
        this.lrcBodyEl.style.cursor = 'pointer';
    },
    updateCls(lines) {
        if (lines.length === 0) {
            return;
        }
        const lineIndex = findCurrentLine(this.audioEl.currentTime, lines);
        if (this.lastIndex === lineIndex) {
            return;
        }
        this.lastIndex = lineIndex;
        if (this.lastEl) {
            this.lastEl.classList.remove('on');
        }
        this.lastEl = this.container.querySelector(`p[data-id=line_${lineIndex}]`);
        if (this.lastEl) {
            this.lastEl.classList.add('on');
            if (lines.length - 1 > lineIndex) {
                const sec = lines[lineIndex + 1].time - lines[lineIndex].time;
                this.lrcBodyEl.style.transition = `transform ${sec}s linear`;
            }
            this.lrcBodyEl.style.transform =
                `translate3d(0,${this.halfCtrHeight - ((lineIndex + 1) * this.lineHeight)}px,0)`;
        }
    },
    load(src) {
        fetch(src).then((res) => {
            res.text().then((txt) => {
                this.parse(txt);
                this.render();
                this.play();
            });
        });
    },
    play() {
        const that = this;
        that.playing = true;
        that.playIntervalId = window.setInterval(() => {
            that.updateCls(that.lrcLines);
        }, 100);
    },
    pause() {
        const that = this;
        that.playing = false;
        this.lrcBodyEl.style.transition = '';
        if (that.playIntervalId !== undefined) {
            window.clearInterval(that.playIntervalId);
        }
    },
    playOrPause() {
        if (this.playing === true) {
            this.pause();
        } else {
            this.play();
        }
    },
    render() {
        const { lrcBodyEl, lrcLines } = this;

        const lrcHtml = [];
        lrcLines.forEach((line, index) => {
            lrcHtml.push(`<p data-id="line_${index}" time="${line.time}">${htmlEncode(line.txt)}</p>`);
        });
        this.setStartCls();
        lrcBodyEl.innerHTML = lrcHtml.join('\n');
        this.lineHeight = lrcLines.length ? lrcBodyEl.getBoundingClientRect().height / lrcLines.length : 0;
    },
    parse(lrcBody) {
        this.lrcLines = [];
        this.tags = {};
        this.parseTags(lrcBody);
        this.parseLines(lrcBody);
    },
    parseLines(body) {
        const lines = body.split('\n');
        let matched;
        lines.forEach((line) => {
            const txt = line.replace(searchRegex, '');
            let time;
            do {
                matched = searchRegex.exec(line);
                if (matched !== null) {
                    time = ((parseInt(matched[1], 10) * 60) +
                        parseInt(matched[2], 10)) + ((parseInt(matched[4], 10) || 0) / 100.0);
                    this.lrcLines.push({
                        txt,
                        time,
                    });
                }
            } while (matched !== null);
        });
        this.lrcLines.sort((a, b) => a.time - b.time);
    },
    parseTags(body) {
        let matched = tagsRegex.exec(body);
        do {
            const [, name, value] = matched;
            this.tags[name] = value;
            matched = tagsRegex.exec(body);
        } while (matched !== null);
    },
});


export default LrcPlayer;
