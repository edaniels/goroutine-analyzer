export default class WebWorker {
  constructor(worker: any, onMessage: any) {
    const code = worker.toString();
    const blob = new Blob(['(' + code + ')()']);
    const out = new Worker(URL.createObjectURL(blob));
    out.onmessage = onMessage;
    return out;
  }
}
