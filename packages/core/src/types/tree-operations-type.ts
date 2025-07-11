// 节点选择状态枚举
export type ExtractValue<T> = T[keyof T];

export const CheckStatus = {
  Unchecked: "0",
  HalfChecked: "1",
  Checked: "2"
} as const;

export type CheckStatusType = ExtractValue<typeof CheckStatus>;

// 树节点类型
export interface TreeNode {
  id: string | number;
  pid: string | number | null;
  check: CheckStatusType; // '0'：未选中, '1'：半选中, '2'：选中
  children?: TreeNode[];
  [key: string]: any; // 用于支持额外的属性
}