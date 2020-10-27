export default function() {
  const startPattern = /^goroutine\s+(\d+)\s+\[([^,]*)(?:, (\d+) minutes)?\]:$/;
  // this is pasted in here again because webworkers ¯\_(ツ)_/¯
  class Goroutine {
    constructor(id, state, timeMinutes) {
      this.lines = [];
      this.id = id;
      this.state = state;
      this.timeMinutes = timeMinutes;
    }
    addLine(line) {
      this.lines.push(line);
    }
    done() {
      this.hash = hash(this.lines.join());
    }
  }
  const hash = s => {
    var hash = 0;
    if (this.length === 0) {
      return hash;
    }
    for (var i = 0; i < this.length; i++) {
      var char = this.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
  };
  function parseGoroutines(text, onParsedGoroutine) {
    const splitText = text.split(/\r?\n/).map(l => l.trim());
    let curGoroutine = null;
    for (let i = 0; i < splitText.length; i++) {
      const line = splitText[i];
      if (line === '') {
        if (curGoroutine && onParsedGoroutine) {
          curGoroutine.done();
          onParsedGoroutine(curGoroutine);
          curGoroutine = null;
        }
        continue;
      }
      const match = startPattern.exec(line);
      if (curGoroutine && !match) {
        curGoroutine.addLine(line);
      }
      if (match) {
        curGoroutine = new Goroutine(
          parseInt(match[1]), // id
          match[2], // state
          match[3] ? parseInt(match[3]) : 0, // time, if specified
        );
      }
    }
  }
  this.addEventListener('message', e => {
    if (!e) return;

    const f = e.data;
    const fr = new FileReader();
    let foo = this;
    fr.onload = function() {
      console.log('calling onload!');
      if (fr.result != null) {
        let parsed = []; //: Goroutine[] = [];
        console.log('calling parse goroutines');
        parseGoroutines(fr.result, gr => {
          parsed.push(gr);
        });
        console.log('called parse goroutines!');
        console.log('got', parsed.length);
        foo.postMessage(parsed);
        //setLoading(false);
      }
    };
    fr.onerror = function() {
      console.error('loading failed', fr.error);
    };
    console.log('calling read as text', f);
    fr.readAsText(f);
    // Do something with the files
  });
}
