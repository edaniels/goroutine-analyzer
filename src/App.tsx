import React, {useCallback, useEffect, useState} from 'react';

import './App.css';
import {useDropzone} from 'react-dropzone';
import {Goroutine} from './parser/DumpParser';
import GoroutineTable from './GoroutineTable';
import './GoroutineFilter.css';
import gopher from './gopher-dance-long-3x.gif';
import WebWorker from './WebWorker';
import worker from './worker'; // eslint-disable-line import/no-webpack-loader-syntax

type GoroutineFilterPickerProps = {
  filters: GoroutineStateFilters;
  setFilters: (fs: GoroutineStateFilters) => void;
  goroutines: Goroutine[];
};

export type GoroutineStateFilter = {
  state: string;
  enabled: boolean;
  count: number;
};

export type GoroutineStateFilters = GoroutineStateFilter[];

const makeFilter = (goroutines: Goroutine[]): GoroutineStateFilters => {
  const out: GoroutineStateFilter[] = [];
  const values: {[key: string]: number} = {};
  goroutines.forEach((g: Goroutine) => {
    values[g.state] = (values[g.state] || 0) + 1;
  });
  Object.keys(values).forEach((key: string) => {
    out.push({state: key, enabled: true, count: values[key]});
  });
  return out;
};

const toggleFilter = (
  filters: GoroutineStateFilters,
  state: string,
): GoroutineStateFilters => {
  const out: GoroutineStateFilters = [];
  for (let i = 0; i < filters.length; i++) {
    let f = {...filters[i]};
    if (filters[i].state === state) {
      f.enabled = !filters[i].enabled;
    }
    out.push(f);
  }
  console.log('returned', out);
  return out;
};

function GoroutineFilterPicker(props: GoroutineFilterPickerProps) {
  return (
    <div className="filter">
      <strong>Filter {props.goroutines.length} goroutines</strong>
      {props.filters.map((f: GoroutineStateFilter) => (
        <div key={f.state}>
          <label>
            <input
              type="checkbox"
              checked={f.enabled}
              onChange={() => {
                props.setFilters(toggleFilter(props.filters, f.state));
              }}></input>
            {f.state} (<b>{f.count}</b>)
          </label>
        </div>
      ))}
    </div>
  );
}

function Loading(props: {loading: boolean}) {
  return props.loading ? (
    <div className="loading-wrapper">
      <img src={gopher} alt="loading" />
      <div className="loading">loading</div>
    </div>
  ) : null;
}

function App() {
  const [workerState, setWorker] = useState<any>();

  const [goroutines, setGoroutines] = useState<Goroutine[]>();
  const [filters, setFilters] = useState<GoroutineStateFilters>([]);

  useEffect(() => {
    console.log('called effect');
    let w = new WebWorker(worker, function(result: any) {
      setLoading(false);
      setGoroutines(result.data);
      setFilters(makeFilter(result.data));
    } as any);
    setWorker(w);
  }, []);

  const [loading, setLoading] = useState<boolean>();
  const onDrop = (acceptedFiles: File[]) => {
    setLoading(true);
    if (acceptedFiles.length === 0) {
      return;
    }
    const f: File = acceptedFiles[0];
    workerState.postMessage(f);
  };
  const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop});
  return (
    <div className="App">
      <Loading loading={loading || false} />
      {!goroutines && !loading && (
        <div className="dropTarget" {...getRootProps()}>
          <input {...getInputProps()} />
          {isDragActive
            ? 'Drop the files here ...'
            : "Drag 'n' drop some files here, or click to select files"}
        </div>
      )}
      <div>
        {goroutines && (
          <GoroutineFilterPicker
            goroutines={goroutines}
            filters={filters}
            setFilters={setFilters}
          />
        )}
      </div>
      <div>
        {goroutines && (
          <GoroutineTable goroutines={goroutines} filters={filters} />
        )}
      </div>
    </div>
  );
}

export default App;
