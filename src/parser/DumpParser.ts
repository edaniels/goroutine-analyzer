const startPattern = /^goroutine\s+(\d+)\s+\[([^,]*)(?:, (\d+) minutes)?\]:$/;

export class Goroutine {
  id: number;
  state: string;
  timeMinutes: number;
  lines: string[] = [];
  hash: number = 0;
  group: Goroutine[] = [];
  constructor(id: number, state: string, timeMinutes: number) {
    this.id = id;
    this.state = state;
    this.timeMinutes = timeMinutes;
  }
  addLine(line: string) {
    this.lines.push(line);
  }
  addGroup(g: Goroutine) {
    this.group.push(g);
  }
  done() {
    const hashLines = this.lines
      .map(line => {
        if (line.startsWith('\t')) {
          const s = line.trim().split(' ');
          if (s.length !== 2) {
            return null;
          }
          console.log(s[0]);
          return s[0];
        }
        return null;
      })
      .filter(l => l);
    //console.log(hashLines.join(''));
    this.hash = hash(hashLines.join(''));
  }
}

const hash = (s: string) => {
  var hash = 0;
  if (s.length === 0) {
    return hash;
  }
  for (var i = 0; i < s.length; i++) {
    var char = s.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
};

export function parseGoroutines(text: string): Goroutine[] {
  let hashes = {};
  let parsed: Goroutine[] = [];
  const splitText = text.split(/\r?\n/);
  let curGoroutine: Goroutine | null = null;
  for (let i = 0; i < splitText.length; i++) {
    const line = splitText[i];
    if (line === '') {
      if (curGoroutine) {
        curGoroutine.done();
        if (curGoroutine.hash !== 0) {
          if (hashes[curGoroutine.hash]) {
            hashes[curGoroutine.hash].addGroup(curGoroutine);
          } else {
            hashes[curGoroutine.hash] = curGoroutine;
            parsed.push(curGoroutine);
          }
        }
        curGoroutine = null;
      }
      continue;
    }
    const match = startPattern.exec(line);
    if (curGoroutine && !match) {
      curGoroutine!.addLine(line);
    }
    if (match) {
      curGoroutine = new Goroutine(
        parseInt(match[1]), // id
        match[2], // state
        match[3] ? parseInt(match[3]) : 0, // time, if specified
      );
    }
  }
  return parsed;
}
