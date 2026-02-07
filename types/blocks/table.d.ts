export interface TableColumn {
  name?: string;
  title?: string;
  type?: string;
  options?: any[];
  className?: string;
  callback?: (item: any) => any;
  width?: string; // 新增width属性
}

export interface Table {
  columns: TableColumn[];
  data: any[];
}
