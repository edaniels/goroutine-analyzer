import React, {useState} from 'react';

import classNames from 'classnames';

import {Goroutine} from './parser/DumpParser';
import './GoroutineTable.css';

type TableProps = {
  goroutines: Goroutine[];
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
    } else if (sortConfig.key === 'time') {
      goroutines.sort((a: Goroutine, b: Goroutine) =>
        sortConfig.direction === SortDirection.Ascending
          ? a.timeMinutes - b.timeMinutes
          : b.timeMinutes - a.timeMinutes,
      );
    }
  }

  return (
    <table className="goTable">
      <TableHeader sortConfig={sortConfig} setSortConfig={setSortConfig} />
      {goroutines.map((g: any) => (
        <tr key={'goroutine_' + g.id}>
          <td className="goId">{g.id}</td>
          <td className="goState">{g.state}</td>
          <td className="goTime">{g.timeMinutes > 0 ? g.timeMinutes : ''}</td>
          <td className="goStack">{g.lines[0]}</td>
        </tr>
      ))}
    </table>
  );
}

type TableHeaderProps = {
  sortConfig: SortConfig;
  setSortConfig: (c: SortConfig) => void;
};
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
      <th>Stack</th>
    </tr>
  );
}
/*
 */
