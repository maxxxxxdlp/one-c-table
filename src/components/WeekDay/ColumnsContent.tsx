import React from 'react';
import { Table } from '../Atoms/Table';
import { localization } from '../../const/localization';
import { RA } from '../../lib/types';
import { View } from '../../app/(entries)/[[...segments]]/useSegments';
import {
  getFirstDayOfWeek,
  months,
  weekDays,
} from '../Atoms/Internationalization';
import { DAY, WEEK } from '../Atoms/timeUnits';
import { ColumnsEdit } from './ColumnsEdit';
import { Form } from '../Atoms';
import { Button } from '../Atoms/Button';
import { useColumnsData } from './useColumnsData';
import { Submit } from '../Atoms/Submit';
import { LoadingBar, loading } from '../Molecules/Loading';
import { className } from '../Atoms/className';
import { EmployeesContext } from '../../app/employees';
import { useStale } from '../Hooks/useStale';

export function ColumnsContent({
  view,
  date,
}: {
  readonly view: View;
  readonly date: Date;
}): JSX.Element {
  const daysCount = (view === 'day' ? DAY : WEEK) / DAY;
  const weekDays = useWeekDays(daysCount, date);

  const {
    columnsData: currentColumnsData,
    setColumnsData,
    onReset: handleReset,
    onSave: handleSave,
  } = useColumnsData(weekDays);
  const { value: columnsData, isStale } = useStale(currentColumnsData);

  const employees = React.useContext(EmployeesContext);

  return (
    <>
      {isStale && <LoadingBar />}
      {typeof columnsData === 'object' && (
        <Form className="contents" onSubmit={(): void => loading(handleSave())}>
          <Table.Container
            className={className.strippedTable}
            style={
              { '--column-count': employees.length } as React.CSSProperties
            }
          >
            <TableHeader weekDays={weekDays} />
            <ColumnsEdit columnsData={columnsData} onChange={setColumnsData} />
          </Table.Container>
          <div className="flex gap-2 justify-between">
            <Button.Danger onClick={handleReset}>
              {localization.cancel}
            </Button.Danger>
            <Submit.Success>{localization.save}</Submit.Success>
          </div>
        </Form>
      )}
    </>
  );
}

export type WeekDay = {
  readonly date: Date;
  readonly weekDay: string;
};

function useWeekDays(daysCount: number, currentDate: Date): RA<WeekDay> {
  return React.useMemo(() => {
    const firstDay = getFirstDayOfWeek(currentDate);

    const dates =
      daysCount === 1
        ? [currentDate]
        : Array.from({ length: daysCount }, (_, index) => {
            const date = new Date(firstDay);
            date.setDate(firstDay.getDate() + index);
            return date;
          });

    return dates.map((date) => ({
      date,
      weekDay: weekDays[date.getDay()],
    }));
  }, [daysCount, currentDate]);
}

function TableHeader({
  weekDays,
}: {
  readonly weekDays: RA<WeekDay>;
}): JSX.Element {
  const employees = React.useContext(EmployeesContext);
  const dateLabel = React.useMemo(
    () =>
      Array.from(new Set(weekDays.map(({ date }) => date.getMonth())))
        .map((monthIndex) => months[monthIndex])
        .join(' - '),
    [weekDays],
  );
  return (
    <Table.Head>
      <Table.Row>
        <Table.Header scope="col">{dateLabel}</Table.Header>
        {employees.map(({ name }, index) => (
          <Table.Header key={index} scope="col">
            {name}
          </Table.Header>
        ))}
      </Table.Row>
    </Table.Head>
  );
}
