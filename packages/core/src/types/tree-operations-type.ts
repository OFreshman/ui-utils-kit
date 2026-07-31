/** 树节点标识。 */
export type TreeNodeId = string | number;

/** 从对象类型中提取值类型。 */
export type ExtractValue<T> = T[keyof T];

/** 节点选择状态枚举。 */
export const CheckStatus = {
  Unchecked: "0",
  HalfChecked: "1",
  Checked: "2"
} as const;

export type CheckStatusType = ExtractValue<typeof CheckStatus>;

/**
 * 树节点类型。
 *
 * `TExtra` 用于保留业务扩展字段，避免通过 `any` 放宽整个节点类型。
 */
export type TreeNode<TExtra extends object = Record<never, never>> = {
  id: TreeNodeId;
  pid?: TreeNodeId | null;
  name?: string;
  check?: CheckStatusType; // "0"：未选中，"1"：半选中，"2"：选中
  children?: Array<TreeNode<TExtra>>;
  isMatched?: boolean;
} & TExtra;

/** 可用于树选择类 API 的节点或节点 ID。 */
export type TreeNodeSelection<TExtra extends object = Record<never, never>> =
  | TreeNodeId
  | TreeNode<TExtra>;