import { FC, useRef } from "react";
import { TableCell } from "@/components/ui/table";
import { log } from "node:util";

interface IProps {
  rowIndex: number;
  column: any;
  row: any;
}

const Column: FC<IProps> = ({ rowIndex, column, row }) => {
  const tdRef = useRef();
  const { key, tdProps = {}, w, textAlign, isMenu, sticky, render } = column;

  return (
    <TableCell
      ref={tdRef}
      {...tdProps}
      w={w}
      bg={rowIndex % 2 === 1 ? "gray.background" : "white.default"}
      p={4}
      textAlign={textAlign ?? (isMenu ? "center" : undefined)}
    >
      {/*{render ? render(row, tdRef) : row[key]}*/}
      {Object.values(row)}
    </TableCell>
  );
};

export default Column;
