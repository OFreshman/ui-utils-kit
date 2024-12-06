// 节点选择状态枚举
export enum CheckStatus {
  Unchecked = "0", // 未选中
  HalfChecked = "1", // 半选中
  Checked = "2" // 选中
}

// 树节点类型
export interface TreeNode {
  id: string | number;
  pid: string | number | null;
  check: CheckStatus; // '0'：未选中, '1'：半选中, '2'：选中
  children?: TreeNode[];
  [key: string]: any; // 用于支持额外的属性
}