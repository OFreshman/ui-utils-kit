// 节点选择状态枚举
export const CheckStatusMap = {
  Unchecked: "0",
  HalfChecked: "1",
  Checked: "2"
} as const;

export type CheckStatus = typeof CheckStatusMap[keyof typeof CheckStatusMap];

// 树节点类型
export interface TreeNode {
  id: string | number;
  pid: string | number | null;
  check: CheckStatus; // '0'：未选中, '1'：半选中, '2'：选中
  children?: TreeNode[];
  [key: string]: any; // 用于支持额外的属性
}