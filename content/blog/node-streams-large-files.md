---
title: "Node.js Streams: Processing a 2GB CSV Without Blowing the Heap"
date: "2021-06-24"
category: "Node.js"
excerpt: "readFile on large files is a memory bomb. Streams process gigabytes in constant memory - here's the pipeline pattern with backpressure handled for you."
---

A data-import job at a client was crashing with `JavaScript heap out of memory`. The culprit: `fs.readFile` on a 2GB CSV export. The fix is the pattern every Node developer eventually needs: stream, transform, stream out.

## The pipeline

```js
const { createReadStream, createWriteStream } = require("fs");
const { createGzip } = require("zlib");
const { pipeline, Transform } = require("stream");

const filterRows = new Transform({
  transform(chunk, _enc, callback) {
    const kept = chunk
      .toString()
      .split("\n")
      .filter((line) => line.includes(",CA,")) // California rows only
      .join("\n");
    callback(null, kept);
  },
});

pipeline(
  createReadStream("orders-2020.csv"),
  filterRows,
  createGzip(),
  createWriteStream("orders-ca.csv.gz"),
  (err) => {
    if (err) console.error("Pipeline failed:", err);
    else console.log("Done.");
  }
);
```

Memory stays flat around 60MB regardless of file size, because only one chunk (default 64KB) is in flight at a time.

## Why pipeline() and not .pipe()

Two reasons. **Error handling**: with `.pipe()` chains, an error in any stream must be handled on *that* stream or the process crashes; `pipeline()` gives you one callback and destroys all streams on failure. **Backpressure** is respected in both, but pipeline cleans up properly when the consumer is slower than the producer — the write stream signals "slow down" and the read stream pauses, automatically.

## The chunk-boundary bug

My `filterRows` above has a subtle bug worth knowing: a chunk can end mid-line, splitting a row across two chunks. Production code should buffer the trailing partial line:

```js
let tail = "";
transform(chunk, _enc, cb) {
  const lines = (tail + chunk).split("\n");
  tail = lines.pop(); // hold incomplete line for next chunk
  cb(null, lines.filter(keep).join("\n") + "\n");
}
```

Or skip the foot-gun and use `csv-parse`, which handles quoting and boundaries correctly. Either way: if the file might be big, never `readFile` it.
