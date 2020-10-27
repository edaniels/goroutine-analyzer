import React, {useState} from 'react';
import {GoroutineStateFilters, GoroutineStateFilter} from './App';

import classNames from 'classnames';

import {Goroutine} from './parser/DumpParser';
import './GoroutineTable.css';

type TableProps = {
  goroutines: Goroutine[];
  filters: GoroutineStateFilters;
};

type SortConfig = {
  key?: string;
  direction: SortDirection;
};

enum SortDirection {
  Ascending = 'asc',
  Descending = 'desc',
}

export default function GoroutineTable(props: TableProps) {
  let defaultConfig: SortConfig = {
    direction: SortDirection.Ascending,
  };
  const [sortConfig, setSortConfig] = useState<SortConfig>(defaultConfig);
  const goroutines = props.goroutines;
  if (sortConfig && sortConfig.key) {
    if (sortConfig.key === 'id') {
      goroutines.sort((a: Goroutine, b: Goroutine) =>
        sortConfig.direction === SortDirection.Ascending
          ? a.id - b.id
          : b.id - a.id,
      );
    } else if (sortConfig!.key === 'state') {
      goroutines.sort((a: Goroutine, b: Goroutine) =>
        sortConfig.direction === SortDirection.Ascending
          ? ('' + a.state).localeCompare(b.state)
          : ('' + b.state).localeCompare(a.state),
      );
    } else if (sortConfig!.key === 'count') {
      goroutines.sort((a: Goroutine, b: Goroutine) =>
        sortConfig.direction === SortDirection.Ascending
          ? a.group.length - b.group.length
          : b.group.length - a.group.length,
      );
    } else if (sortConfig.key === 'time') {
      goroutines.sort((a: Goroutine, b: Goroutine) =>
        sortConfig.direction === SortDirection.Ascending
          ? a.timeMinutes - b.timeMinutes
          : b.timeMinutes - a.timeMinutes,
      );
    }
  }
  const filterSet = new Set<string>();
  for (var i = 0; i < props.filters.length; i++) {
    if (props.filters[i].enabled) {
      filterSet.add(props.filters[i].state);
    }
  }

  return (
    <table className="goTable">
      <TableHeader sortConfig={sortConfig} setSortConfig={setSortConfig} />
      <tbody>
        {goroutines.map((g: any) =>
          filterSet.has(g.state) ? (
            <tr key={'goroutine_' + g.id}>
              <td className="goId">{g.id}</td>
              <td className="goState">{g.state}</td>
              <td className="goTime">
                {g.timeMinutes > 0 ? g.timeMinutes : ''}
              </td>
              <td>{g.group.length === 0 ? '' : g.group.length + 1}</td>
              <td className="goStack">
                <Stack goroutine={g} />
              </td>
            </tr>
          ) : null,
        )}
      </tbody>
    </table>
  );
}

type TableHeaderProps = {
  sortConfig: SortConfig;
  setSortConfig: (c: SortConfig) => void;
};

function Stack(props: {goroutine: Goroutine}) {
  const [collapsed, setCollapsed] = useState<boolean>(true);
  return (
    <>
      <span
        className="expand"
        onClick={() => {
          setCollapsed(!collapsed);
        }}>
        {collapsed ? '\u25B6' : '\u25bc'}
      </span>
      <code>
        {' '}
        {collapsed
          ? props.goroutine.lines[0]
          : props.goroutine.lines.join('\n')}
      </code>
    </>
  );
}

function TableHeader(props: TableHeaderProps) {
  const getClassNamesFor = (name: string) => {
    if (!props.sortConfig || !props.sortConfig.key) {
      return 'sortable'; // nothing being sorted yet
    }
    if (props.sortConfig.key === name) {
      return classNames(
        'sortable',
        props.sortConfig.direction === SortDirection.Ascending ? 'asc' : 'desc',
      );
    }
    return undefined;
  };

  const updateSort = (name: string) => {
    return () => {
      if (props.sortConfig.key !== name) {
        props.setSortConfig({
          key: name,
          direction: SortDirection.Descending,
        });
        return;
      }

      console.log(
        props.sortConfig.direction,
        props.sortConfig.direction === SortDirection.Descending
          ? SortDirection.Ascending
          : SortDirection.Descending,
      );
      props.setSortConfig({
        key: name,
        direction:
          props.sortConfig.direction === SortDirection.Descending
            ? SortDirection.Ascending
            : SortDirection.Descending,
      });
    };
  };

  return (
    <thead>
      <tr>
        <th onClick={updateSort('id')} className={getClassNamesFor('id')}>
          ID
        </th>
        <th onClick={updateSort('state')} className={getClassNamesFor('state')}>
          State
        </th>
        <th onClick={updateSort('time')} className={getClassNamesFor('time')}>
          Time&nbsp;(min)
        </th>
        <th onClick={updateSort('count')} className={getClassNamesFor('count')}>
          Count
        </th>
        <th>Stack</th>
      </tr>
    </thead>
  );
}
