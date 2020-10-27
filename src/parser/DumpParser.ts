const startPattern = /^goroutine\s+(\d+)\s+\[([^,]*)(?:, (\d+) minutes)?\]:$/;

export class Goroutine {
  id: number;
  state: string;
  timeMinutes: number;
  lines: string[] = [];
  constructor(id: number, state: string, timeMinutes: number) {
    this.id = id;
    this.state = state;
    this.timeMinutes = timeMinutes;
  }
  addLine(line: string) {
    this.lines.push(line);
  }
}

export function parseGoroutines(
  text: string,
  onParsedGoroutine: (gr: Goroutine) => void,
) {
  const splitText = text.split(/\r?\n/).map((l: string): string => l.trim());
  let curGoroutine: Goroutine | null = null;
  for (let i = 0; i < splitText.length; i++) {
    const line = splitText[i];
    if (line === '') {
      if (curGoroutine && onParsedGoroutine) {
        onParsedGoroutine(curGoroutine);
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
}
/*

function parseFile(file, callback) {
    var fileSize   = file.size;
    var chunkSize  = 64 * 1024; // bytes
    var offset     = 0;
    var self       = this; // we need a reference to the current object
    var chunkReaderBlock = null;

    var readEventHandler = function(evt) {
    }

    chunkReaderBlock = function(_offset, length, _file) {
        var r = new FileReader();
        var blob = _file.slice(_offset, length + _offset);
        r.onload = readEventHandler;
        r.readAsText(blob);
    }

    // now let's start the read with the first block
    chunkReaderBlock(offset, chunkSize, file);
}

*/
