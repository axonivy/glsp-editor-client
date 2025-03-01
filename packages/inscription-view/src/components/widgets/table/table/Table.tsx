import './Table.css';
import { forwardRef, type ComponentPropsWithRef } from 'react';
import { Flex, Table } from '@axonivy/ui-components';
import SearchInput from '../../input/SearchInput';

type TableProps = ComponentPropsWithRef<typeof Table> & {
  search?: { value: string; onChange: (value: string) => void };
};

export const SearchTable = forwardRef<HTMLTableElement, TableProps>(({ search, ...props }, forwardRef) => (
  <Flex direction='column' gap={1}>
    {search && <SearchInput placeholder='Search' {...search} />}
    <Table ref={forwardRef} {...props} />
  </Flex>
));
