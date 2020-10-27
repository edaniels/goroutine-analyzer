import React, {useCallback, useState} from 'react';

import './App.css';
import {useDropzone} from 'react-dropzone';
import {Goroutine, parseGoroutines} from './parser/DumpParser';
import GoroutineTable from './GoroutineTable';
import './GoroutineFilter.css';

type GoroutineFilterProps = {
  goroutines: Goroutine[];
};

function GoroutineFilter(props: GoroutineFilterProps) {
  const values: {[key: string]: number} = {};
  props.goroutines.forEach((g: Goroutine) => {
    values[g.state] = (values[g.state] || 0) + 1;
  });
  return (
    <div className="filter">
      <strong>Filter {props.goroutines.length} goroutines</strong>
      {Object.entries(values).map(([k, v]: [string, number]) => (
        <div key={k}>
          <label>
            <input type="checkbox"></input>
            {k} (<b>{v}</b>)
          </label>
        </div>
      ))}
    </div>
  );
}
function App() {
  const [goroutines, setGoroutines] = useState<Goroutine[]>();
  const onDrop = useCallback(acceptedFiles => {
    acceptedFiles.forEach((f: any) => {
      const fr = new FileReader();
      fr.onload = function() {
        if (fr.result != null) {
          let parsed: Goroutine[] = [];
          parseGoroutines(fr.result as string, (gr: Goroutine) => {
            parsed.push(gr);
          });
          setGoroutines(parsed);
        }
      };
      fr.onerror = function() {
        console.log('result is', fr.error);
      };
      fr.readAsText(f);
    });
    // Do something with the files
  }, []);
  const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop});

  return (
    <div className="App">
      {!goroutines && (
        <div className="dropTarget" {...getRootProps()}>
          <input {...getInputProps()} />
          {isDragActive
            ? 'Drop the files here ...'
            : "Drag 'n' drop some files here, or click to select files"}
        </div>
      )}
      <div>{goroutines && <GoroutineFilter goroutines={goroutines} />}</div>
      <div>{goroutines && <GoroutineTable goroutines={goroutines} />}</div>
    </div>
  );
}

export default App;
